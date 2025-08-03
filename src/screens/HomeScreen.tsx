import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getStoredBoxes, getStoredLocations } from "../lib/database";
import type { Box, Location } from "../lib/types";
import type { HomeStackParamList } from "../navigation/HomeStack";

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'HomeMain'>;

export default function HomeScreen() {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when screen comes into focus (e.g., returning from BoxDetailsScreen)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

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
    navigation.navigate('BoxDetails', { box });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      marginBottom: 16,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    statsContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginBottom: 24,
      gap: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: 20,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statNumber: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: 8,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    quickActions: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 16,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    actionText: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 12,
      fontWeight: "500",
    },
    recentActivity: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    loadingText: {
      textAlign: "center",
      color: theme.colors.textSecondary,
      fontSize: 16,
      paddingVertical: 20,
    },
    boxList: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      shadowColor: theme.colors.shadow,
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
      borderBottomColor: theme.colors.border,
    },
    boxIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryLight,
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
      color: theme.colors.text,
      marginBottom: 2,
    },
    boxLocation: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    boxDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
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
      color: theme.colors.primary,
      fontWeight: "600",
    },
    emptyState: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 40,
      alignItems: "center",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: 20,
    },
    createFirstButton: {
      backgroundColor: theme.colors.primary,
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
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      shadowColor: theme.colors.shadow,
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
      borderBottomColor: theme.colors.border,
      gap: 12,
    },
    locationName: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "500",
    },
    locationCount: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    viewAllLocationsButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      gap: 8,
    },
  });

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
          <Ionicons name="cube-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.statNumber}>{boxes.length}</Text>
          <Text style={styles.statLabel}>Boxes</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="location-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.statNumber}>{locations.length}</Text>
          <Text style={styles.statLabel}>Locations</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.actionText}>Create New Box</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="scan-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.actionText}>Scan QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="search-outline" size={24} color={theme.colors.primary} />
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
                  <Ionicons name="cube" size={20} color={theme.colors.primary} />
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
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}

            {boxes.length > 5 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>
                  View All {boxes.length} Boxes
                </Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color={theme.colors.textSecondary} />
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
                <Ionicons name="location" size={16} color={theme.colors.primary} />
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
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}


    </ScrollView>
  );
}


