import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  addMilestone,
  deleteMilestone,
  getChildMonthlyPoints,
  getMilestonesForChild,
  isMilestoneCompleted,
  markMilestoneCompleted,
} from "../db/database";

type MilestonesRouteParams = {
  childId: number;
  childName: string;
};

export function MilestonesScreen() {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<{ Milestones: MilestonesRouteParams }, "Milestones">>();
  const { childId, childName } = route.params;

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("");
  const [currentPoints, setCurrentPoints] = useState(0);
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  const loadMilestones = () => getMilestonesForChild(childId, setMilestones);

  const loadCurrentPoints = () => {
    getChildMonthlyPoints(childId, (points) => {
      setCurrentPoints(points);
      checkCompletedMilestones(points);
    });
  };

  const checkCompletedMilestones = (points: number) => {
    milestones.forEach((m) => {
      isMilestoneCompleted(childId, m.id!, (completed) => {
        if (points >= m.pointsRequired && !completed) {
          markMilestoneCompleted(childId, m.id!);
          setCompletedIds((prev) => [...prev, m.id!]);
        } else if (completed) {
          setCompletedIds((prev) => [...prev, m.id!]);
        }
      });
    });
  };

  useEffect(() => {
    loadMilestones();
    loadCurrentPoints();
  }, []);

  useEffect(() => {
    checkCompletedMilestones(currentPoints);
  }, [milestones]);

  const handleAdd = () => {
    if (!title || !points) return;
    addMilestone({ childId, title, pointsRequired: Number(points) }, () => {
      setTitle("");
      setPoints("");
      loadMilestones();
    });
  };

  const handleDelete = (id?: number) => {
    if (!id) return;
    deleteMilestone(id, () => {
      loadMilestones();
      loadCurrentPoints();
      setCompletedIds((prev) => prev.filter((cid) => cid !== id));
    });
  };

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.headerText}>{childName}'s Milestones</Text>
      </View>

      <Text style={styles.subHeader}>Current Points: {currentPoints}</Text>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Reward Item"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TextInput
          placeholder="Points"
          value={points}
          onChangeText={setPoints}
          style={styles.input}
          keyboardType="number-pad"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={milestones}
        keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => {
          const completed =
            currentPoints >= item.pointsRequired ||
            completedIds.includes(item.id!);
          return (
            <View style={styles.milestoneCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.milestoneText}>{item.title}</Text>
                <Text style={styles.pointsText}>{item.pointsRequired} pts</Text>
                <Text
                  style={completed ? styles.completedText : styles.pendingText}
                >
                  {completed ? "Completed" : "Pending"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.noMilestones}>No milestones yet.</Text>
        }
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
  subHeader: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 20,
    color: "#555",
    textAlign: "center",
  },
  inputRow: { flexDirection: "row", marginBottom: 20, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  addButton: { backgroundColor: "#ff6b6b", padding: 10, borderRadius: 8 },
  addButtonText: { color: "#fff", fontWeight: "600" },
  milestoneCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffe5ec",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  milestoneText: { fontSize: 16, fontWeight: "500" },
  pointsText: { fontSize: 14, color: "#555", marginTop: 2 },
  completedText: { color: "green", fontWeight: "600", marginTop: 4 },
  pendingText: { color: "#ff3b30", fontWeight: "600", marginTop: 4 },
  deleteText: { color: "#ff6b6b", fontWeight: "600" },
  noMilestones: { textAlign: "center", marginTop: 40, color: "#777" },
});
