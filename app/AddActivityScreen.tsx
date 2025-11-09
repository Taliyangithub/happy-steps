import { Picker } from "@react-native-picker/picker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { addActivity, getChildren } from "../db/database";
import { Child } from "../models/child";

// Define the type for route params
type AddActivityRouteParams = {
  childId?: number;
  childName?: string;
};

export function AddActivityScreen() {
  const navigation = useNavigation();

  // Use typed route
  const route =
    useRoute<
      RouteProp<{ AddActivity: AddActivityRouteParams }, "AddActivity">
    >();
  const { childId, childName } = route.params ?? {};

  const [title, setTitle] = useState<string>("");
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | undefined>(
    childId
  );

  useEffect(() => {
    if (!selectedChildId) getChildren(setChildren);
  }, [selectedChildId]);

  const handleAdd = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title.");
      return;
    }
    if (!selectedChildId) {
      Alert.alert("Error", "Please select a child.");
      return;
    }

    addActivity({ childId: selectedChildId, title: title.trim() }, () =>
      navigation.goBack()
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add Activity</Text>
      {!selectedChildId && (
        <View style={styles.card}>
          <Text style={styles.label}>Select Child</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedChildId}
              onValueChange={setSelectedChildId}
            >
              <Picker.Item label="Select a child..." value={undefined} />
              {children.map((c) => (
                <Picker.Item key={c.id} label={c.name} value={c.id} />
              ))}
            </Picker>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Activity Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Brushing Teeth"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>Add Activity</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff0f3",
    flexGrow: 1,
  },
  backButton: {
    marginBottom: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#ffe5ec",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
