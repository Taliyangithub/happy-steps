import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { getDailyChecksForChild } from "../db/database";

type ActivityHistoryRouteParams = {
  childId: number;
  childName: string;
};

export function ActivityHistoryScreen() {
  const navigation = useNavigation();
  const route =
    useRoute<
      RouteProp<
        { ActivityHistory: ActivityHistoryRouteParams },
        "ActivityHistory"
      >
    >();
  const { childId, childName } = route.params;

  const [history, setHistory] = useState<
    { activityId: number; title: string; date: string; done: boolean }[]
  >([]);

  const loadHistory = useCallback(() => {
    getDailyChecksForChild(childId, setHistory);
  }, [childId]);

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener("focus", loadHistory);
    return unsubscribe;
  }, [navigation, loadHistory]);

  const renderItem = ({
    item,
  }: {
    item: { activityId: number; title: string; date: string; done: boolean };
  }) => (
    <View style={styles.historyCard}>
      <Text style={styles.activityTitle}>{item.title}</Text>
      <Text style={styles.dateText}>{item.date}</Text>
      <Text
        style={[
          styles.statusText,
          { color: item.done ? "#2b9348" : "#d00000" },
        ]}
      >
        {item.done ? "Done" : "Not Done"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/images/icons8-calander-94.png")}
          style={styles.headerIcon}
        />
        <Text style={styles.headerText}>{childName}'s Activity History</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item, index) => `${item.activityId}-${index}`}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No activity history yet.</Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff0f3",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerIcon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  historyCard: {
    backgroundColor: "#ffe5ec",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  statusText: {
    fontSize: 16,
    marginTop: 6,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#777",
  },
});
