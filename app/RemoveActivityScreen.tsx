import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteActivity, getActivitiesForChild } from "../db/database";
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
type RemoveActivityScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "RemoveActivity"
>;
type RemoveActivityScreenRouteProp = RouteProp<
  RootStackParamList,
  "RemoveActivity"
>;

export function RemoveActivityScreen() {
  const navigation = useNavigation<RemoveActivityScreenNavigationProp>();
  const route = useRoute<RemoveActivityScreenRouteProp>();
  const { childId, childName } = route.params;

  const [activities, setActivities] = useState<Activity[]>([]);

  const loadActivities = () => getActivitiesForChild(childId, setActivities);

  useEffect(() => {
    loadActivities();
    const unsubscribe = navigation.addListener("focus", loadActivities);
    return unsubscribe;
  }, [navigation]);

  const confirmRemove = (activity: Activity) => {
    Alert.alert(
      "Remove Activity?",
      `Do you want to remove "${activity.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteActivity(activity.id!, loadActivities),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{childName}'s Activities</Text>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.activityCard}>
            <Text style={styles.title}>{item.title}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => confirmRemove(item)}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No activities found.</Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff0f3" },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  activityCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffe5ec",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: { fontSize: 18, color: "#333", fontWeight: "600" },
  removeButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeText: { color: "#fff", fontWeight: "600" },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#777",
  },
});
