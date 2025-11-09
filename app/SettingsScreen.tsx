import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteAllData, getSetting, saveSetting } from "../db/database";

// Navigation param list
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  AddChild: undefined;
  AddActivity: { childId?: number; childName?: string };
  ChildChecklist: { childId: number; childName: string };
  ActivityHistory: { childId: number; childName: string };
  RemoveActivity: { childId: number; childName: string };
  Milestones: { childId: number; childName: string };
};

export function SettingsScreen() {
  const navigation = useNavigation();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [monthlyRetention, setMonthlyRetention] = useState(false);

  useEffect(() => {
    getSetting("soundEnabled", (value) => setSoundEnabled(value !== "false"));
    getSetting("monthlyRetention", (value) =>
      setMonthlyRetention(value === "true")
    );
  }, []);

  const toggleSound = (value: boolean) => {
    setSoundEnabled(value);
    saveSetting("soundEnabled", value ? "true" : "false");
  };

  const toggleRetention = (value: boolean) => {
    setMonthlyRetention(value);
    saveSetting("monthlyRetention", value ? "true" : "false");
    if (value) {
      Alert.alert(
        "Auto Cleanup Enabled",
        "Unused or old data, such as completed daily activities, rewards, and milestone records, will be automatically removed when you open the app. This helps keep the app fast and your data tidy."
      );
    }
  };

  const confirmReset = () => {
    Alert.alert(
      "Reset All Data?",
      "This will remove all children and reset the app. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Reset",
          style: "destructive",
          onPress: () => {
            deleteAllData(() => {
              Alert.alert("All data has been reset!");
              navigation.navigate("Home");
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/images/icons8-settings-100.png")}
          style={styles.headerIcon}
          resizeMode="contain"
        />
        <Text style={styles.header}>Settings</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Preferences</Text>

        <View style={styles.row}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Image
              source={require("../assets/images/icons8-sound-64.png")}
              style={styles.rowIcon}
              resizeMode="contain"
            />
            <Text style={[styles.rowText, { flexShrink: 1 }]}>
              Sound Effects
            </Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={toggleSound}
            thumbColor={soundEnabled ? "#ff6b6b" : "#ccc"}
            trackColor={{ true: "#ffc2d1", false: "#ddd" }}
          />
        </View>

        <View style={[styles.row, { marginTop: 10 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Image
              source={require("../assets/images/icons8-calander-94.png")}
              style={styles.rowIcon}
              resizeMode="contain"
            />
            <Text style={[styles.rowText, { flexShrink: 1 }]}>
              Auto cleanup
            </Text>
          </View>
          <Switch
            value={monthlyRetention}
            onValueChange={toggleRetention}
            thumbColor={monthlyRetention ? "#ff6b6b" : "#ccc"}
            trackColor={{ true: "#ffc2d1", false: "#ddd" }}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Management</Text>

        <TouchableOpacity style={styles.dangerButton} onPress={confirmReset}>
          <Image
            source={require("../assets/images/icons8-trash-48.png")}
            style={styles.buttonIcon}
            resizeMode="contain"
          />
          <Text style={styles.dangerButtonText}>Reset All Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff0f3",
    padding: 20,
  },
  headerContainer: { alignItems: "center", marginBottom: 30 },
  headerIcon: { width: 70, height: 70, marginBottom: 10 },
  header: { fontSize: 28, fontWeight: "700", color: "#333" },
  card: {
    backgroundColor: "#ffe5ec",
    borderRadius: 16,
    width: "100%",
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rowText: { fontSize: 16, fontWeight: "500", color: "#333" },
  rowIcon: { width: 28, height: 28, marginRight: 10 },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6b6b",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 10,
  },
  buttonIcon: { width: 22, height: 22, marginRight: 10 },
  dangerButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
