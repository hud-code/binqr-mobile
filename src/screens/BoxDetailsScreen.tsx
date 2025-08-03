import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import QRCode from "react-native-qrcode-svg";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import {
  getStoredLocations,
  updateBox,
  deleteBox,
  generateNewQRCode,
} from "../lib/database";
import type { Box, Location } from "../lib/types";
import type { HomeStackParamList } from "../navigation/HomeStack";
import type { SearchStackParamList } from "../navigation/SearchStack";

type BoxDetailsNavigation = StackNavigationProp<HomeStackParamList | SearchStackParamList, 'BoxDetails'>;
type BoxDetailsRoute = RouteProp<HomeStackParamList | SearchStackParamList, 'BoxDetails'>;

export default function BoxDetailsScreen() {
  const navigation = useNavigation<BoxDetailsNavigation>();
  const route = useRoute<BoxDetailsRoute>();
  const { box } = route.params;
  const [editedBox, setEditedBox] = useState<Box>(box);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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

  const handleUpdateImage = async () => {
    Alert.alert("Update Image", "Choose how you want to update the box image", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setEditedBox({
          ...editedBox,
          photo_urls: [result.assets[0].uri],
        });
        setIsEditing(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setEditedBox({
          ...editedBox,
          photo_urls: [result.assets[0].uri],
        });
        setIsEditing(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSaveChanges = async () => {
    if (!editedBox.name.trim()) {
      Alert.alert("Error", "Box name is required");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Updating box with data:', {
        name: editedBox.name.trim(),
        description: editedBox.description?.trim(),
        photo_urls: editedBox.photo_urls,
        tags: editedBox.tags,
        location_id: editedBox.location_id,
      });

      const updatedBox = await updateBox(editedBox.id, {
        name: editedBox.name.trim(),
        description: editedBox.description?.trim(),
        photo_urls: editedBox.photo_urls,
        tags: editedBox.tags,
        location_id: editedBox.location_id,
      });

      if (updatedBox) {
        console.log('Box updated successfully:', updatedBox);
        setEditedBox(updatedBox);
        setIsEditing(false);
        Alert.alert("Success", "Box updated successfully!");
      } else {
        console.error('Update returned null');
        Alert.alert("Error", "Failed to update box");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update box");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBox = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBox = async () => {
    if (deleteConfirmText !== editedBox.name) {
      Alert.alert("Error", "Box name does not match. Please type the exact box name to confirm deletion.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await deleteBox(editedBox.id);
      if (success) {
        Alert.alert("Success", "Box deleted successfully!", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Error", "Failed to delete box");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete box");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
    }
  };

  const handleGenerateNewQR = () => {
    Alert.alert(
      "Generate New QR Code",
      "This will create a new QR code for this box. The old QR code will no longer work.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Generate",
          onPress: async () => {
            setIsLoading(true);
            try {
              const newQRCode = await generateNewQRCode(editedBox.id);
              if (newQRCode) {
                setEditedBox({ ...editedBox, qr_code: newQRCode });
                Alert.alert("Success", "New QR code generated!");
              } else {
                Alert.alert("Error", "Failed to generate new QR code");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to generate new QR code");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleShareQR = async () => {
    try {
      await Share.share({
        message: `BinQR Box: ${editedBox.name}\nQR Code: ${editedBox.qr_code}`,
        title: `BinQR - ${editedBox.name}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share QR code");
    }
  };

  const handlePrintQR = async () => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>BinQR - ${editedBox.name}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 40px;
                margin: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
              }
              .title {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #2563eb;
              }
              .box-name {
                font-size: 24px;
                margin-bottom: 30px;
                color: #333;
              }
              .qr-container {
                margin: 40px 0;
                padding: 20px;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                background: #f9f9f9;
              }
              .qr-code {
                margin: 20px 0;
              }
              .qr-text {
                font-family: monospace;
                font-size: 14px;
                color: #666;
                margin-top: 20px;
              }
              .description {
                font-size: 16px;
                color: #666;
                margin: 20px 0;
              }
              .tags {
                font-size: 14px;
                color: #888;
                margin: 20px 0;
              }
              .location {
                font-size: 14px;
                color: #888;
                margin: 10px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="title">BinQR</div>
              <div class="box-name">${editedBox.name}</div>
              
              <div class="qr-container">
                <div class="qr-code">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(editedBox.qr_code)}" alt="QR Code" />
                </div>
                <div class="qr-text">${editedBox.qr_code}</div>
              </div>
              
              ${editedBox.description ? `<div class="description">${editedBox.description}</div>` : ''}
              ${editedBox.tags.length > 0 ? `<div class="tags">Contents: ${editedBox.tags.join(', ')}</div>` : ''}
              ${editedBox.location_id ? `<div class="location">Location: ${getLocationName(editedBox.location_id)}</div>` : ''}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Print QR Code - ${editedBox.name}`,
      });
    } catch (error) {
      console.error('Error printing QR code:', error);
      Alert.alert("Error", "Failed to generate printable QR code");
    }
  };

  const getLocationName = (locationId: string): string => {
    const location = locations.find((loc) => loc.id === locationId);
    return location?.name || "Unknown Location";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={styles.container}>


      <ScrollView style={styles.content}>
        {/* Box Image */}
        <View style={styles.imageSection}>
          {editedBox.photo_urls.length > 0 ? (
            <Image
              source={{ uri: editedBox.photo_urls[0] }}
              style={styles.boxImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="cube" size={48} color="#999" />
              <Text style={styles.placeholderText}>No image</Text>
            </View>
          )}

          {isEditing && (
            <TouchableOpacity
              style={styles.updateImageButton}
              onPress={handleUpdateImage}
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.updateImageText}>Update Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Box Details Form */}
        <View style={styles.detailsSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Box Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputReadonly]}
              value={editedBox.name}
              onChangeText={(text) =>
                setEditedBox({ ...editedBox, name: text })
              }
              editable={isEditing}
              placeholder="Enter box name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                !isEditing && styles.inputReadonly,
              ]}
              value={editedBox.description || ""}
              onChangeText={(text) =>
                setEditedBox({ ...editedBox, description: text })
              }
              editable={isEditing}
              placeholder="Enter description"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contents/Tags</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                !isEditing && styles.inputReadonly,
              ]}
              value={editedBox.tags.join(", ")}
              onChangeText={(text) =>
                setEditedBox({
                  ...editedBox,
                  tags: text
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t),
                })
              }
              editable={isEditing}
              placeholder="Enter contents separated by commas"
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity
              style={[styles.input, styles.locationPicker]}
              onPress={() => isEditing && setShowLocationPicker(true)}
              disabled={!isEditing}
            >
              <Text style={styles.locationText}>
                {getLocationName(editedBox.location_id || "")}
              </Text>
              {isEditing && (
                <Ionicons name="chevron-down" size={20} color="#666" />
              )}
            </TouchableOpacity>
          </View>

          {/* Metadata */}
          <View style={styles.metadataSection}>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Created:</Text>
              <Text style={styles.metadataValue}>
                {formatDate(editedBox.created_at)}
              </Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Updated:</Text>
              <Text style={styles.metadataValue}>
                {formatDate(editedBox.updated_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>QR Code</Text>
          <View style={styles.qrContainer}>
            <QRCode value={editedBox.qr_code} size={200} />
            <Text style={styles.qrCodeText}>{editedBox.qr_code}</Text>
          </View>

          <View style={styles.qrActions}>
            <TouchableOpacity
              style={styles.qrActionButton}
              onPress={handleShareQR}
            >
              <Ionicons name="share" size={20} color="#2563eb" />
              <Text style={styles.qrActionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.qrActionButton}
              onPress={handleGenerateNewQR}
            >
              <Ionicons name="refresh" size={20} color="#2563eb" />
              <Text style={styles.qrActionText}>New QR</Text>
            </TouchableOpacity>
          </View>
        </View>


      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        {isEditing ? (
          // Edit mode: Save Changes and Cancel
          <>
            <TouchableOpacity
              style={[styles.bottomButton, styles.cancelButton]}
              onPress={() => {
                setEditedBox(box); // Reset to original data
                setIsEditing(false);
              }}
              disabled={isLoading}
            >
              <Ionicons name="close" size={20} color="#666" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bottomButton, styles.saveButton]}
              onPress={handleSaveChanges}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="checkmark" size={20} color="white" />
              )}
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </>
        ) : (
          // View mode: Edit, Delete, Print QR
          <>
            <TouchableOpacity
              style={[styles.bottomButton, styles.editButton]}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil" size={20} color="#2563eb" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bottomButton, styles.deleteButton]}
              onPress={handleDeleteBox}
            >
              <Ionicons name="trash" size={20} color="#dc2626" />
              <Text style={styles.deleteButtonText}>Delete Box</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bottomButton, styles.printButton]}
              onPress={handlePrintQR}
            >
              <Ionicons name="print" size={20} color="#16a34a" />
              <Text style={styles.printButtonText}>Print QR</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.locationModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.locationList}>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationOption,
                    editedBox.location_id === location.id &&
                      styles.locationOptionSelected,
                  ]}
                  onPress={() => {
                    setEditedBox({ ...editedBox, location_id: location.id });
                    setShowLocationPicker(false);
                  }}
                >
                  <Ionicons
                    name={
                      editedBox.location_id === location.id
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={20}
                    color={
                      editedBox.location_id === location.id ? "#2563eb" : "#666"
                    }
                  />
                  <Text
                    style={[
                      styles.locationOptionText,
                      editedBox.location_id === location.id &&
                        styles.locationOptionTextSelected,
                    ]}
                  >
                    {location.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Box</Text>
              <TouchableOpacity onPress={() => {
                setShowDeleteConfirm(false);
                setDeleteConfirmText("");
              }}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.deleteModalContent}>
              <Text style={styles.deleteWarning}>
                This action cannot be undone. To confirm deletion, please type the box name:
              </Text>
              <Text style={styles.boxNameToDelete}>"{editedBox.name}"</Text>
              
              <TextInput
                style={styles.deleteConfirmInput}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder="Type box name here"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={[styles.deleteModalButton, styles.cancelDeleteButton]}
                  onPress={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                >
                  <Text style={styles.cancelDeleteText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deleteModalButton, 
                    styles.confirmDeleteButton,
                    deleteConfirmText !== editedBox.name && styles.confirmDeleteButtonDisabled
                  ]}
                  onPress={confirmDeleteBox}
                  disabled={deleteConfirmText !== editedBox.name || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.confirmDeleteText}>Delete Box</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  bottomActionBar: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Account for safe area
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    gap: 12,
  },
  bottomButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  editButtonText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  deleteButtonText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
  },
  printButton: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#16a34a",
  },
  printButtonText: {
    color: "#16a34a",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#16a34a",
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  imageSection: {
    margin: 20,
    position: "relative",
  },
  boxImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  placeholderImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
    marginTop: 8,
  },
  updateImageButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  updateImageText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  detailsSection: {
    backgroundColor: "white",
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
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
  inputReadonly: {
    backgroundColor: "#f9f9f9",
    color: "#666",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  locationPicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    color: "#333",
  },
  metadataSection: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    marginTop: 4,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  metadataValue: {
    fontSize: 14,
    color: "#333",
  },
  qrSection: {
    backgroundColor: "white",
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  qrContainer: {
    alignItems: "center",
    gap: 16,
  },
  qrCodeText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  qrActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
  },
  qrActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  qrActionText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  // Delete Modal Styles
  deleteModal: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    maxWidth: "90%",
    alignSelf: "center",
  },
  deleteModalContent: {
    padding: 20,
  },
  deleteWarning: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  boxNameToDelete: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 20,
  },
  deleteConfirmInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "white",
  },
  deleteModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelDeleteButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelDeleteText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmDeleteButton: {
    backgroundColor: "#dc2626",
  },
  confirmDeleteButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  confirmDeleteText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  locationModal: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 12,
    maxHeight: "70%",
    minWidth: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  locationList: {
    maxHeight: 300,
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  locationOptionSelected: {
    backgroundColor: "#f0f9ff",
  },
  locationOptionText: {
    fontSize: 16,
    color: "#333",
  },
  locationOptionTextSelected: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
