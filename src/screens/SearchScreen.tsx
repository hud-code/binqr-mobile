import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { searchBoxes, getStoredLocations } from "../lib/database";
import type { Box, Location } from "../lib/types";
import BoxDetailsScreen from "./BoxDetailsScreen";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchResults, setSearchResults] = useState<Box[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [showBoxDetails, setShowBoxDetails] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const locationData = await getStoredLocations();
      setLocations(locationData);
    } catch (error) {
      console.error("Error loading locations:", error);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim() && selectedLocation === "all") {
      // If no search criteria, don't search
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const results = await searchBoxes(
        searchQuery.trim(),
        selectedLocation === "all" ? undefined : selectedLocation
      );
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching boxes:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedLocation("all");
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleBoxPress = (box: Box) => {
    setSelectedBox(box);
    setShowBoxDetails(true);
  };

  const handleBoxUpdated = (updatedBox: Box) => {
    setSearchResults(
      searchResults.map((box) => (box.id === updatedBox.id ? updatedBox : box))
    );
    setSelectedBox(updatedBox);
  };

  const handleBoxDeleted = () => {
    if (selectedBox) {
      setSearchResults(
        searchResults.filter((box) => box.id !== selectedBox.id)
      );
      setShowBoxDetails(false);
      setSelectedBox(null);
    }
  };

  const handleCloseBoxDetails = () => {
    setShowBoxDetails(false);
    setSelectedBox(null);
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
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search boxes by name, description, or contents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={performSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderLocationFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Filter by Location:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.locationFilters}
      >
        <TouchableOpacity
          style={[
            styles.locationChip,
            selectedLocation === "all" && styles.locationChipSelected,
          ]}
          onPress={() => setSelectedLocation("all")}
        >
          <Text
            style={[
              styles.locationChipText,
              selectedLocation === "all" && styles.locationChipTextSelected,
            ]}
          >
            All Locations
          </Text>
        </TouchableOpacity>

        {locations.map((location) => (
          <TouchableOpacity
            key={location.id}
            style={[
              styles.locationChip,
              selectedLocation === location.id && styles.locationChipSelected,
            ]}
            onPress={() => setSelectedLocation(location.id)}
          >
            <Text
              style={[
                styles.locationChipText,
                selectedLocation === location.id &&
                  styles.locationChipTextSelected,
              ]}
            >
              {location.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSearchButton = () => (
    <TouchableOpacity
      style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
      onPress={performSearch}
      disabled={isSearching}
    >
      <Ionicons name="search" size={20} color="white" />
      <Text style={styles.searchButtonText}>
        {isSearching ? "Searching..." : "Search"}
      </Text>
    </TouchableOpacity>
  );

  const renderBoxItem = (box: Box) => (
    <TouchableOpacity
      key={box.id}
      style={styles.boxItem}
      onPress={() => handleBoxPress(box)}
    >
      <View style={styles.boxItemContent}>
        {box.photo_urls.length > 0 ? (
          <Image
            source={{ uri: box.photo_urls[0] }}
            style={styles.boxThumbnail}
          />
        ) : (
          <View style={styles.boxThumbnailPlaceholder}>
            <Ionicons name="cube" size={24} color="#2563eb" />
          </View>
        )}

        <View style={styles.boxItemInfo}>
          <Text style={styles.boxItemName}>{box.name}</Text>
          {box.description && (
            <Text style={styles.boxItemDescription} numberOfLines={2}>
              {box.description}
            </Text>
          )}
          <View style={styles.boxItemMeta}>
            <View style={styles.boxItemMetaRow}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={styles.boxItemMetaText}>
                {box.location?.name || "Unknown Location"}
              </Text>
            </View>
            <View style={styles.boxItemMetaRow}>
              <Ionicons name="time" size={14} color="#666" />
              <Text style={styles.boxItemMetaText}>
                {getRelativeTime(box.updated_at)}
              </Text>
            </View>
          </View>
          {box.tags.length > 0 && (
            <View style={styles.boxItemTags}>
              {box.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.boxItemTag}>
                  <Text style={styles.boxItemTagText}>{tag}</Text>
                </View>
              ))}
              {box.tags.length > 3 && (
                <Text style={styles.boxItemTagsMore}>
                  +{box.tags.length - 3} more
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#999" />
    </TouchableOpacity>
  );

  const renderResults = () => {
    if (isSearching) {
      return (
        <View style={styles.resultsContainer}>
          <Text style={styles.searchingText}>Searching...</Text>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#999" />
          <Text style={styles.emptyStateTitle}>Search Your Boxes</Text>
          <Text style={styles.emptyStateText}>
            Enter a search term or select a location filter to find your stored
            items
          </Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color="#999" />
          <Text style={styles.emptyStateTitle}>No Results Found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search terms or location filter
          </Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}{" "}
            found
          </Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.resultsList}>
          {searchResults.map(renderBoxItem)}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        {renderSearchBar()}
        {renderLocationFilter()}
        {renderSearchButton()}
      </View>

      {renderResults()}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  searchHeader: {
    backgroundColor: "white",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  locationFilters: {
    flexDirection: "row",
  },
  locationChip: {
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  locationChipSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  locationChipText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  locationChipTextSelected: {
    color: "white",
  },
  searchButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  searchButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  searchButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  searchingText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 40,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  resultsList: {
    flex: 1,
  },
  boxItem: {
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
  boxItemContent: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  boxThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  boxThumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
  },
  boxItemInfo: {
    flex: 1,
  },
  boxItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  boxItemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 18,
  },
  boxItemMeta: {
    marginBottom: 8,
  },
  boxItemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  boxItemMetaText: {
    fontSize: 12,
    color: "#666",
  },
  boxItemTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  boxItemTag: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  boxItemTagText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "500",
  },
  boxItemTagsMore: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
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
  },
});
