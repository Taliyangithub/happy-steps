import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  deleteChildWithData,
  getActivitiesForChild,
  getChildren,
  getDailyChecks,
} from "../db/database";
import { Child } from "../models/child";

interface ChildWithProgress extends Child {
  doneCount: number;
  totalCount: number;
}

const today = new Date().toISOString().slice(0, 10);

export function HomeScreen() {
  const navigation = useNavigation();
  const [children, setChildren] = useState<ChildWithProgress[]>([]);

  const loadChildrenWithProgress = () => {
    getChildren((childList) => {
      const updatedChildren: ChildWithProgress[] = [];
      let remainingChildren = childList.length;

      if (remainingChildren === 0) {
        setChildren([]);
        return;
      }

      childList.forEach((child) => {
        getActivitiesForChild(child.id!, (activities) => {
          const total = activities.length;
          if (total === 0) {
            updatedChildren.push({ ...child, doneCount: 0, totalCount: 0 });
            remainingChildren--;
            if (remainingChildren === 0) setChildren([...updatedChildren]);
            return;
          }

          let completed = 0;
          let checkedCount = 0;

          activities.forEach((activity) => {
            getDailyChecks(activity.id!, today, (checks) => {
              if (checks.length > 0 && checks[0].done) completed++;
              checkedCount++;
              if (checkedCount === activities.length) {
                updatedChildren.push({
                  ...child,
                  doneCount: completed,
                  totalCount: total,
                });
                remainingChildren--;
                if (remainingChildren === 0) setChildren([...updatedChildren]);
              }
            });
          });
        });
      });
    });
  };

  useEffect(() => {
    loadChildrenWithProgress();
    const unsubscribe = navigation.addListener(
      "focus",
      loadChildrenWithProgress
    );
    return unsubscribe;
  }, [navigation]);

  const confirmDeleteChild = (childId: number, childName: string) => {
    Alert.alert(
      "Remove Child",
      `Are you sure you want to remove "${childName}" and all their activities? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteChildWithData(childId, loadChildrenWithProgress),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {children.length > 0 && (
        <View style={styles.headerContainer}>
          <Image
            source={require("../assets/images/icons8-family-100.png")}
            style={styles.headerIcon}
            resizeMode="contain"
          />
          <Text style={styles.header}>Your Children</Text>
        </View>
      )}

      <FlatList
        data={children}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image
              source={require("../assets/images/icons8-child-96.png")}
              style={styles.emptyIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>Welcome to Happy Steps</Text>
            <Text style={styles.emptyText}>
              Add your children to start tracking their daily activities and
              progress.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate("AddChild")}
            >
              <Text style={styles.primaryButtonText}>Add Child</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.childCard}>
            <TouchableOpacity
              style={styles.deleteIconWrapper}
              onPress={() => confirmDeleteChild(item.id!, item.name)}
            >
              <Image
                source={require("../assets/images/icons8-cancel-48.png")}
                style={styles.deleteIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.childInfo}
              onPress={() =>
                navigation.navigate("ChildChecklist", {
                  childId: item.id!,
                  childName: item.name,
                })
              }
            >
              <Image
                source={require("../assets/images/icons8-user-64.png")}
                style={styles.childIcon}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.childName}>{item.name}</Text>
                {item.totalCount > 0 ? (
                  <Text style={styles.progressText}>
                    {item.doneCount}/{item.totalCount} done today
                  </Text>
                ) : (
                  <Text style={styles.progressText}>No activities yet</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {children.length > 0 && (
        <TouchableOpacity
          style={styles.addChildFloating}
          onPress={() => navigation.navigate("AddChild")}
        >
          <Text style={styles.addChildFloatingText}>+</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate("Settings")}
      >
        <Text style={styles.settingsText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff0f3", padding: 20 },
  headerContainer: { alignItems: "center", marginBottom: 20 },
  headerIcon: { width: 60, height: 60, marginBottom: 8 },
  header: { fontSize: 26, fontWeight: "700", color: "#333" },
  childCard: {
    backgroundColor: "#ffe5ec",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
  },
  deleteIconWrapper: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    width: 24,
    height: 24,
  },
  deleteIcon: { width: 24, height: 24 },
  childInfo: { flexDirection: "row", alignItems: "center" },
  childIcon: { width: 40, height: 40, marginRight: 12 },
  childName: { fontSize: 20, fontWeight: "600", color: "#333" },
  progressText: { fontSize: 14, color: "#555" },
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 30,
  },
  emptyIcon: { width: 80, height: 80, marginBottom: 20 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  primaryButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  addChildFloating: {
    position: "absolute",
    bottom: 80,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: "#ff6b6b",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addChildFloatingText: { color: "#fff", fontSize: 32, fontWeight: "700" },
  settingsButton: { alignItems: "center", marginTop: 10, marginBottom: 10 },
  settingsText: { fontSize: 16, fontWeight: "600", color: "#ff6b6b" },
});
