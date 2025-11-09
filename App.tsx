import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { ActivityIndicator, View } from "react-native";

import { ActivityHistoryScreen } from "./app/ActivityHistoryScreen";
import { AddActivityScreen } from "./app/AddActivityScreen";
import { AddChildScreen } from "./app/AddChildScreen";
import { ChildChecklistScreen } from "./app/ChildChecklistScreen";
import { HomeScreen } from "./app/HomeScreen";
import { MilestonesScreen } from "./app/MilestonesScreen";
import { RemoveActivityScreen } from "./app/RemoveActivityScreen";
import { SettingsScreen } from "./app/SettingsScreen";
import { cleanUnusedData, getSetting, initDB } from "./db/database";

const RootStack = createNativeStackNavigator({
  initialRouteName: "Home",
  screens: {
    Home: HomeScreen,
    AddChild: AddChildScreen,
    AddActivity: AddActivityScreen,
    Settings: SettingsScreen,
    ChildChecklist: ChildChecklistScreen,
    ActivityHistory: ActivityHistoryScreen,
    RemoveActivity: RemoveActivityScreen,
    Milestones: MilestonesScreen,
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  const [dbReady, setDbReady] = React.useState(false);

  React.useEffect(() => {
    try {
      initDB();
      setDbReady(true);
      getSetting("monthlyRetention", (value) => {
        if (value === "true") {
          cleanUnusedData();
        }
      });
    } catch (error) {
      console.error("DB init failed:", error);
    }
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  return <Navigation />;
}
