import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { addChild } from "../db/database";

// Define your navigation param list
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

// Type navigation prop
type AddChildScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddChild"
>;

export function AddChildScreen() {
  const navigation = useNavigation<AddChildScreenNavigationProp>();
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addChild({ name: name.trim() }, () => navigation.navigate("Home"));
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/icons8-child-96.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.header}>Add a Child</Text>

      <Text style={styles.label}>What's your little one's name?</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter child's name"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add Child</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff0f3",
    paddingHorizontal: 20,
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    fontSize: 16,
    color: "#444",
    marginBottom: 10,
  },
  input: {
    width: "80%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 18,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 20,
  },
  backText: {
    color: "#ff6b6b",
    fontSize: 18,
    fontWeight: "600",
  },
});
