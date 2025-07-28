import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { getStoredBoxes, getStoredLocations } from "../lib/database";
import type { Box, Location } from "../lib/types";
import BoxDetailsScreen from "./BoxDetailsScreen";

export default function HomeScreen() {
  const { profile } = useAuth();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [showBoxDetails, setShowBoxDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [boxesData, locationsData] = await Promise.all([
        getStoredBoxes(),
        getStoredLocations(),
      ]);
      setBoxes(boxesData);
      setLocations(locationsData);
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

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30)
      return `${Math.floor(diffInDays / 7)} week${
        Math.floor(diffInDays / 7) === 1 ? "" : "s"
      } ago`;
    return `${Math.floor(diffInDays / 30)} month${
      Math.floor(diffInDays / 30) === 1 ? "" : "s"
    } ago`;
  };

  const handleBoxPress = (box: Box) => {
    setSelectedBox(box);
    setShowBoxDetails(true);
  };

  const handleBoxUpdated = (updatedBox: Box) => {
    setBoxes(boxes.map((box) => (box.id === updatedBox.id ? updatedBox : box)));
    setSelectedBox(updatedBox);
  };

  const handleBoxDeleted = () => {
    if (selectedBox) {
      setBoxes(boxes.filter((box) => box.id !== selectedBox.id));
      setShowBoxDetails(false);
      setSelectedBox(null);
    }
  };

  const handleCloseBoxDetails = () => {
    setShowBoxDetails(false);
    setSelectedBox(null);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}!
        </Text>
        <Text style={styles.subtitle}>Organize your storage with QR codes</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="cube-outline" size={24} color="#2563eb" />
          <Text style={styles.statNumber}>{boxes.length}</Text>
          <Text style={styles.statLabel}>Boxes</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="location-outline" size={24} color="#2563eb" />
          <Text style={styles.statNumber}>{locations.length}</Text>
          <Text style={styles.statLabel}>Locations</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add-circle-outline" size={24} color="#2563eb" />
          <Text style={styles.actionText}>Create New Box</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="scan-outline" size={24} color="#2563eb" />
          <Text style={styles.actionText}>Scan QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="search-outline" size={24} color="#2563eb" />
          <Text style={styles.actionText}>Search Boxes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Boxes</Text>

        {isLoading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : boxes.length > 0 ? (
          <View style={styles.boxList}>
            {boxes.slice(0, 5).map((box) => (
              <TouchableOpacity
                key={box.id}
                style={styles.boxItem}
                onPress={() => handleBoxPress(box)}
              >
                <View style={styles.boxIcon}>
                  <Ionicons name="cube" size={20} color="#2563eb" />
                </View>
                <View style={styles.boxInfo}>
                  <Text style={styles.boxName}>{box.name}</Text>
                  <Text style={styles.boxLocation}>
                    {box.location?.name || "Unknown Location"}
                  </Text>
                  <Text style={styles.boxDate}>
                    {getRelativeTime(box.updated_at)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>
            ))}

            {boxes.length > 5 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>
                  View All {boxes.length} Boxes
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#2563eb" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color="#999" />
            <Text style={styles.emptyStateTitle}>No boxes yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first storage box to get started
            </Text>
            <TouchableOpacity style={styles.createFirstButton}>
              <Text style={styles.createFirstButtonText}>Create Box</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {locations.length > 0 && (
        <View style={styles.locationsSection}>
          <Text style={styles.sectionTitle}>Your Locations</Text>
          <View style={styles.locationsList}>
            {locations.slice(0, 3).map((location) => (
              <View key={location.id} style={styles.locationItem}>
                <Ionicons name="location" size={16} color="#2563eb" />
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationCount}>
                  {
                    boxes.filter((box) => box.location_id === location.id)
                      .length
                  }{" "}
                  boxes
                </Text>
              </View>
            ))}

            {locations.length > 3 && (
              <TouchableOpacity style={styles.viewAllLocationsButton}>
                <Text style={styles.viewAllText}>View All Locations</Text>
                <Ionicons name="arrow-forward" size={16} color="#2563eb" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {selectedBox && (
        <Modal
          visible={showBoxDetails}
          animationType="slide"
          onRequestClose={handleCloseBoxDetails}
        >
          <BoxDetailsScreen
            box={selectedBox}
            onClose={handleCloseBoxDetails}
            onBoxUpdated={handleBoxUpdated}
            onBoxDeleted={handleBoxDeleted}
          />
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    fontWeight: "500",
  },
  recentActivity: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    paddingVertical: 20,
  },
  boxList: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boxItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  boxIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  boxInfo: {
    flex: 1,
  },
  boxName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  boxLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  boxDate: {
    fontSize: 12,
    color: "#999",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  viewAllText: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  locationsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  locationsList: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  locationName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  locationCount: {
    fontSize: 14,
    color: "#666",
  },
  viewAllLocationsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
});
