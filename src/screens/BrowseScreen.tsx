import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { getStoredBoxes, getStoredLocations, searchBoxes } from "../lib/database";
import type { Box, Location } from "../lib/types";
import type { BrowseStackParamList } from "../navigation/BrowseStack";
import { useTheme } from "../context/ThemeContext";

type BrowseScreenNavigationProp = StackNavigationProp<BrowseStackParamList, 'BrowseMain'>;

export default function BrowseScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<BrowseScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [locations, setLocations] = useState<Location[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [filteredBoxes, setFilteredBoxes] = useState<Box[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationFilter, setShowLocationFilter] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Apply filters whenever search query, location, or boxes change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedLocation, boxes]);

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

  const applyFilters = async () => {
    let filtered = boxes;

    // Apply location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter(box => box.location_id === selectedLocation);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      try {
        // Use the search function for text-based filtering
        const searchResults = await searchBoxes(
          searchQuery.trim(),
          selectedLocation === "all" ? undefined : selectedLocation
        );
        filtered = searchResults;
      } catch (error) {
        console.error("Error searching boxes:", error);
      }
    }

    setFilteredBoxes(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("all");
  };

  const handleBoxPress = (box: Box) => {
    navigation.navigate('BoxDetails', { box });
  };

  const getLocationName = (locationId: string): string => {
    const location = locations.find(loc => loc.id === locationId);
    return location?.name || "Unknown Location";
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

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search boxes by name, contents, description..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderLocationFilter = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={styles.locationFilterButton}
        onPress={() => setShowLocationFilter(!showLocationFilter)}
      >
        <Ionicons name="location" size={16} color={theme.colors.primary} />
        <Text style={styles.locationFilterText}>
          {selectedLocation === "all" ? "All Locations" : getLocationName(selectedLocation)}
        </Text>
        <Ionicons 
          name={showLocationFilter ? "chevron-up" : "chevron-down"} 
          size={16} 
          color={theme.colors.primary} 
        />
      </TouchableOpacity>

      {showLocationFilter && (
        <View style={styles.locationOptions}>
          <TouchableOpacity
            style={[
              styles.locationOption,
              selectedLocation === "all" && styles.locationOptionSelected,
            ]}
            onPress={() => {
              setSelectedLocation("all");
              setShowLocationFilter(false);
            }}
          >
            <Ionicons
              name={selectedLocation === "all" ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={selectedLocation === "all" ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.locationOptionText,
                selectedLocation === "all" && styles.locationOptionTextSelected,
              ]}
            >
              All Locations
            </Text>
          </TouchableOpacity>

          {locations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={[
                styles.locationOption,
                selectedLocation === location.id && styles.locationOptionSelected,
              ]}
              onPress={() => {
                setSelectedLocation(location.id);
                setShowLocationFilter(false);
              }}
            >
              <Ionicons
                name={selectedLocation === location.id ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={selectedLocation === location.id ? "#2563eb" : "#666"}
              />
              <Text
                style={[
                  styles.locationOptionText,
                  selectedLocation === location.id && styles.locationOptionTextSelected,
                ]}
              >
                {location.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderFilterSummary = () => {
    const hasFilters = searchQuery.trim() || selectedLocation !== "all";
    
    if (!hasFilters) return null;

    return (
      <View style={styles.filterSummary}>
        <View style={styles.filterSummaryContent}>
          <Text style={styles.filterSummaryText}>
            {filteredBoxes.length} box{filteredBoxes.length !== 1 ? "es" : ""} found
          </Text>
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBoxItem = (box: Box) => (
    <TouchableOpacity
      key={box.id}
      style={styles.boxItem}
      onPress={() => handleBoxPress(box)}
    >
      <View style={styles.boxImageContainer}>
        {box.photo_urls.length > 0 ? (
          <Image source={{ uri: box.photo_urls[0] }} style={styles.boxImage} />
        ) : (
          <View style={styles.placeholderImage}>
                            <Ionicons name="cube" size={24} color={theme.colors.placeholder} />
          </View>
        )}
      </View>

      <View style={styles.boxInfo}>
        <Text style={styles.boxName}>{box.name}</Text>
        
        {box.description && (
          <Text style={styles.boxDescription} numberOfLines={2}>
            {box.description}
          </Text>
        )}

        <View style={styles.boxMeta}>
          <View style={styles.boxLocation}>
                              <Ionicons name="location" size={12} color={theme.colors.textSecondary} />
            <Text style={styles.boxLocationText}>
              {getLocationName(box.location_id || "")}
            </Text>
          </View>
          <Text style={styles.boxDate}>{getRelativeTime(box.updated_at)}</Text>
        </View>

        {box.tags.length > 0 && (
          <View style={styles.boxTags}>
            {box.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {box.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{box.tags.length - 3} more</Text>
            )}
          </View>
        )}
      </View>

                    <Ionicons name="chevron-forward" size={16} color={theme.colors.placeholder} />
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading boxes...</Text>
        </View>
      );
    }

    if (boxes.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={64} color={theme.colors.placeholder} />
          <Text style={styles.emptyStateTitle}>No Boxes Yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first box to get started organizing your storage
          </Text>
        </View>
      );
    }

    if (filteredBoxes.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={64} color={theme.colors.placeholder} />
          <Text style={styles.emptyStateTitle}>No Results Found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search terms or filters
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.boxesList}>
        {filteredBoxes.map(renderBoxItem)}
      </View>
    );
  };

  const styles = createStyles(theme);

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
            <Text style={styles.title}>Browse Boxes</Text>
            <Text style={styles.subtitle}>
              {boxes.length} box{boxes.length !== 1 ? "es" : ""} in storage
            </Text>
          </View>
        </View>

        {renderSearchBar()}
        {renderLocationFilter()}
        {renderFilterSummary()}
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    shadowColor: theme.colors.shadow,
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
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  searchContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  filterContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  locationFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
  },
  locationFilterText: {
    flex: 1,
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "500",
  },
  locationOptions: {
    marginTop: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    overflow: "hidden",
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 12,
  },
  locationOptionSelected: {
    backgroundColor: theme.colors.primaryLight,
  },
  locationOptionText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  locationOptionTextSelected: {
    color: "#2563eb",
    fontWeight: "600",
  },
  filterSummary: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterSummaryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterSummaryText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
  clearFiltersButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearFiltersText: {
    fontSize: 14,
    color: "#2563eb",
    textDecorationLine: "underline",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  boxesList: {
    padding: 20,
    gap: 12,
  },
  boxItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  boxImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
  },
  boxImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.disabled,
    justifyContent: "center",
    alignItems: "center",
  },
  boxInfo: {
    flex: 1,
  },
  boxName: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },
  boxDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  boxMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  boxLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  boxLocationText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  boxDate: {
    fontSize: 12,
    color: "#999",
  },
  boxTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  tag: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "500",
  },
  moreTagsText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
  },
});