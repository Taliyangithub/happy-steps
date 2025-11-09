import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getActivitiesForChild,
  getDailyChecks,
  markDailyCheck,
} from "../db/database";
import { Activity } from "../models/activity";

// Define your navigation params
export type RootStackParamList = {
  Home: undefined;
  AddChild: undefined;
  AddActivity: { childId?: number; childName?: string };
  Settings: undefined;
  ChildChecklist: { childId: number; childName: string };
  ActivityHistory: { childId: number; childName: string };
  RemoveActivity: { childId: number; childName: string };
  Milestones: { childId: number; childName: string };
};

// Navigation & Route props
type ChildChecklistScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ChildChecklist"
>;
type ChildChecklistScreenRouteProp = RouteProp<
  RootStackParamList,
  "ChildChecklist"
>;

export function ChildChecklistScreen() {
  const navigation = useNavigation<ChildChecklistScreenNavigationProp>();
  const route = useRoute<ChildChecklistScreenRouteProp>();
  const { childId, childName } = route.params;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [doneMap, setDoneMap] = useState<Record<number, boolean>>({});
  const today = new Date().toISOString().slice(0, 10);

  const loadActivities = useCallback(() => {
    getActivitiesForChild(childId, (rows) => {
      setActivities(rows);
      const tempDoneMap: Record<number, boolean> = {};
      let remaining = rows.length;

      if (remaining === 0) {
        setDoneMap({});
        return;
      }

      rows.forEach((activity) => {
        getDailyChecks(activity.id!, today, (checks) => {
          tempDoneMap[activity.id!] =
            checks.length > 0 ? !!checks[0].done : false;
          remaining -= 1;
          if (remaining === 0) setDoneMap(tempDoneMap);
        });
      });
    });
  }, [childId]);

  useEffect(() => {
    loadActivities();
    const unsubscribe = navigation.addListener("focus", loadActivities);
    return unsubscribe;
  }, [navigation, loadActivities]);

  const toggleActivity = (activityId: number, value: boolean) => {
    if (doneMap[activityId] && !value) return;
    markDailyCheck(activityId, childId, today, value, 1, () => {
      setDoneMap((prev) => ({ ...prev, [activityId]: value }));
    });
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.headerText}>{childName}'s Checklist</Text>
      </View>

      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("AddActivity", { childId, childName })
          }
        >
          <Text style={styles.buttonText}>Add Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("RemoveActivity", { childId, childName })
          }
        >
          <Text style={styles.buttonText}>Remove Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("Milestones", { childId, childName })
          }
        >
          <Text style={styles.buttonText}>Milestones</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.activityCard}>
            <View style={styles.activityInfo}>
              <Image
                source={require("../assets/images/icons8-star-48.png")}
                style={styles.activityIcon}
              />
              <Text style={styles.activityText}>{item.title}</Text>
            </View>
            <Switch
              value={doneMap[item.id!] || false}
              onValueChange={(v) => toggleActivity(item.id!, v)}
              disabled={doneMap[item.id!]}
              trackColor={{ false: "#f4a4a4", true: "#81e6d9" }}
              thumbColor={doneMap[item.id!] ? "#2b7a78" : "#fff"}
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noActivities}>No activities added yet.</Text>
        }
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff0f3" },
  navButtonText: { fontSize: 16, fontWeight: "600", color: "#ff6b6b" },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  topControls: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  addButton: {
    flex: 1,
    minWidth: 120,
    marginVertical: 5,
    marginHorizontal: 5,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#ff6b6b",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe5ec",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    justifyContent: "space-between",
  },
  activityInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  activityIcon: { width: 24, height: 24, marginRight: 10 },
  activityText: { fontSize: 18, fontWeight: "500", color: "#333" },
  noActivities: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#777",
  },
  list: { marginTop: 20 },
});
