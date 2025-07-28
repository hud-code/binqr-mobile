import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getStoredLocations,
  getStoredBoxes,
  saveLocation,
  updateLocation,
  deleteLocation,
} from "../lib/database";
import type { Location, Box } from "../lib/types";

export default function LocationsScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationDescription, setNewLocationDescription] = useState("");
  const [editLocationName, setEditLocationName] = useState("");
  const [editLocationDescription, setEditLocationDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [locationsData, boxesData] = await Promise.all([
        getStoredLocations(),
        getStoredBoxes(),
      ]);
      setLocations(locationsData);
      setBoxes(boxesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getBoxCountForLocation = (locationId: string): number => {
    return boxes.filter((box) => box.location_id === locationId).length;
  };

  const handleCreateLocation = async () => {
    if (!newLocationName.trim()) {
      Alert.alert("Error", "Please enter a location name");
      return;
    }

    setIsCreating(true);
    try {
      const newLocation = await saveLocation({
        name: newLocationName.trim(),
        description: newLocationDescription.trim() || undefined,
      });

      if (newLocation) {
        setLocations([newLocation, ...locations]);
        setShowAddModal(false);
        setNewLocationName("");
        setNewLocationDescription("");
        Alert.alert("Success", "Location created successfully!");
      } else {
        Alert.alert("Error", "Failed to create location");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create location");
    } finally {
      setIsCreating(false);
    }
  };

  const handleLocationPress = (location: Location) => {
    const boxCount = getBoxCountForLocation(location.id);
    const locationBoxes = boxes.filter(
      (box) => box.location_id === location.id
    );

    Alert.alert(
      location.name,
      `${location.description || "No description"}\n\n${boxCount} box${
        boxCount !== 1 ? "es" : ""
      } stored here`,
      [
        {
          text: "View Boxes",
          onPress: () => handleViewBoxes(location, locationBoxes),
        },
        {
          text: "Edit Location",
          onPress: () => handleEditLocation(location),
        },
        { text: "Close", style: "cancel" },
      ]
    );
  };

  const handleViewBoxes = (location: Location, locationBoxes: Box[]) => {
    if (locationBoxes.length === 0) {
      Alert.alert(
        "No Boxes",
        `There are no boxes stored in ${location.name} yet.`,
        [{ text: "OK" }]
      );
      return;
    }

    // Show list of boxes in this location
    const boxList = locationBoxes
      .map((box, index) => `${index + 1}. ${box.name}`)
      .join("\n");

    Alert.alert(
      `Boxes in ${location.name}`,
      `${locationBoxes.length} box${
        locationBoxes.length !== 1 ? "es" : ""
      }:\n\n${boxList}`,
      [{ text: "OK" }]
    );
  };

  const handleEditLocation = (location: Location) => {
    Alert.alert("Edit Location", `Edit "${location.name}"`, [
      {
        text: "Rename",
        onPress: () => {
          setEditingLocation(location);
          setEditLocationName(location.name);
          setEditLocationDescription(location.description || "");
          setShowEditModal(true);
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteLocation(location),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleDeleteLocation = (location: Location) => {
    const boxCount = getBoxCountForLocation(location.id);

    Alert.alert(
      "Delete Location",
      `Are you sure you want to delete "${location.name}"?${
        boxCount > 0
          ? `\n\nWarning: This location has ${boxCount} box${
              boxCount !== 1 ? "es" : ""
            } stored in it. You'll need to move them to another location first.`
          : ""
      }`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (boxCount > 0) {
              Alert.alert(
                "Cannot Delete",
                "Please move all boxes to another location before deleting this location.",
                [{ text: "OK" }]
              );
              return;
            }

            setIsUpdating(true);
            try {
              const success = await deleteLocation(location.id);

              if (success) {
                setLocations(locations.filter((loc) => loc.id !== location.id));
                Alert.alert("Success", "Location deleted successfully!");
              } else {
                Alert.alert("Error", "Failed to delete location");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete location");
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateLocation = async () => {
    if (!editLocationName.trim() || !editingLocation) {
      Alert.alert("Error", "Please enter a location name");
      return;
    }

    setIsUpdating(true);
    try {
      const updatedLocation = await updateLocation(editingLocation.id, {
        name: editLocationName.trim(),
        description: editLocationDescription.trim() || undefined,
      });

      if (updatedLocation) {
        setLocations(
          locations.map((loc) =>
            loc.id === editingLocation.id ? updatedLocation : loc
          )
        );
        setShowEditModal(false);
        setEditingLocation(null);
        setEditLocationName("");
        setEditLocationDescription("");
        Alert.alert("Success", "Location updated successfully!");
      } else {
        Alert.alert("Error", "Failed to update location");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update location");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderLocationItem = (location: Location) => {
    const boxCount = getBoxCountForLocation(location.id);

    return (
      <TouchableOpacity
        key={location.id}
        style={styles.locationItem}
        onPress={() => handleLocationPress(location)}
      >
        <View style={styles.locationIcon}>
          <Ionicons name="location" size={20} color="#2563eb" />
        </View>

        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>{location.name}</Text>
          {location.description && (
            <Text style={styles.locationDescription} numberOfLines={2}>
              {location.description}
            </Text>
          )}
          <Text style={styles.locationStats}>
            {boxCount} box{boxCount !== 1 ? "es" : ""}
          </Text>
        </View>

        <View style={styles.locationActions}>
          <View style={styles.boxCountBadge}>
            <Text style={styles.boxCountText}>{boxCount}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#999" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderAddLocationModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setShowAddModal(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Add Location</Text>

          <TouchableOpacity
            style={[
              styles.modalSaveButton,
              (!newLocationName.trim() || isCreating) &&
                styles.modalSaveButtonDisabled,
            ]}
            onPress={handleCreateLocation}
            disabled={!newLocationName.trim() || isCreating}
          >
            <Text
              style={[
                styles.modalSaveText,
                (!newLocationName.trim() || isCreating) &&
                  styles.modalSaveTextDisabled,
              ]}
            >
              {isCreating ? "Creating..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.modalForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Garage, Attic, Storage Room"
                value={newLocationName}
                onChangeText={setNewLocationName}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add details about this location..."
                value={newLocationDescription}
                onChangeText={setNewLocationDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderEditLocationModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEditModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setShowEditModal(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Edit Location</Text>

          <TouchableOpacity
            style={[
              styles.modalSaveButton,
              (!editLocationName.trim() || isUpdating) &&
                styles.modalSaveButtonDisabled,
            ]}
            onPress={handleUpdateLocation}
            disabled={!editLocationName.trim() || isUpdating}
          >
            <Text
              style={[
                styles.modalSaveText,
                (!editLocationName.trim() || isUpdating) &&
                  styles.modalSaveTextDisabled,
              ]}
            >
              {isUpdating ? "Updating..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.modalForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Garage, Attic, Storage Room"
                value={editLocationName}
                onChangeText={setEditLocationName}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add details about this location..."
                value={editLocationDescription}
                onChangeText={setEditLocationDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Storage Locations</Text>
            <Text style={styles.subtitle}>
              Manage where you store your boxes
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{locations.length}</Text>
            <Text style={styles.statLabel}>Locations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{boxes.length}</Text>
            <Text style={styles.statLabel}>Total Boxes</Text>
          </View>
        </View>

        {isLoading ? (
          <Text style={styles.loadingText}>Loading locations...</Text>
        ) : locations.length > 0 ? (
          <View style={styles.locationsList}>
            {locations.map(renderLocationItem)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color="#999" />
            <Text style={styles.emptyStateTitle}>No Locations Yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first storage location to organize your boxes better
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.createFirstButtonText}>
                Add First Location
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {locations.length > 0 && (
          <View style={styles.helpCard}>
            <Ionicons name="information-circle" size={20} color="#2563eb" />
            <Text style={styles.helpText}>
              Tap on a location to view its boxes and manage settings
            </Text>
          </View>
        )}
      </ScrollView>

      {renderAddLocationModal()}
      {renderEditLocationModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    backgroundColor: "#2563eb",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  statsCard: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 20,
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 40,
  },
  locationsList: {
    paddingHorizontal: 20,
  },
  locationItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  locationDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    lineHeight: 18,
  },
  locationStats: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "500",
  },
  locationActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  boxCountBadge: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  boxCountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createFirstButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  helpCard: {
    backgroundColor: "#f0f9ff",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: "#2563eb",
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalCancelButton: {
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: "#666",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalSaveButton: {
    paddingVertical: 8,
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveText: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "600",
  },
  modalSaveTextDisabled: {
    color: "#999",
  },
  modalContent: {
    flex: 1,
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
});
