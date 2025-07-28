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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import QRCode from "react-native-qrcode-svg";
import { v4 as uuidv4 } from "uuid";

import { getStoredLocations, saveBox, saveLocation } from "../lib/database";
import type { Location, CreateBoxFormData } from "../lib/types";
import { useAuth } from "../context/AuthContext";

type Step = "photo" | "details" | "review";

interface BoxDetails {
  name: string;
  description: string;
  locationId: string;
  tags: string;
}

export default function CreateScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("photo");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [boxDetails, setBoxDetails] = useState<BoxDetails>({
    name: "",
    description: "",
    locationId: "",
    tags: "",
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [generatedQR, setGeneratedQR] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNewLocationForm, setShowNewLocationForm] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");

  useEffect(() => {
    loadLocations();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera roll permissions to add photos to your boxes."
      );
    }
  };

  const loadLocations = async () => {
    try {
      const locationData = await getStoredLocations();
      setLocations(locationData);
    } catch (error) {
      console.error("Error loading locations:", error);
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
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Add Photo",
      "Choose how you want to add a photo of your box contents",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const proceedToDetails = () => {
    if (!capturedImage) {
      Alert.alert(
        "Photo Required",
        "Please add a photo of your box contents first."
      );
      return;
    }
    setStep("details");
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setStep("photo");
  };

  const handleCreateLocation = async () => {
    if (!newLocationName.trim()) {
      Alert.alert("Error", "Please enter a location name");
      return;
    }

    try {
      const newLocation = await saveLocation({
        name: newLocationName.trim(),
        description: "",
      });

      if (newLocation) {
        setLocations([newLocation, ...locations]);
        setBoxDetails({ ...boxDetails, locationId: newLocation.id });
        setNewLocationName("");
        setShowNewLocationForm(false);
        Alert.alert("Success", "Location created successfully!");
      } else {
        Alert.alert("Error", "Failed to create location");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create location");
    }
  };

  const handleDetailsSubmit = async () => {
    if (!boxDetails.name.trim() || !boxDetails.locationId) {
      Alert.alert("Error", "Please fill in the box name and select a location");
      return;
    }

    if (!user) {
      Alert.alert("Error", "Please sign in to create boxes");
      return;
    }

    setIsProcessing(true);

    try {
      // Generate QR code data
      const boxId = uuidv4();
      const qrData = `BinQR:${boxId}`;

      // Prepare box data
      const boxData: CreateBoxFormData & { qr_code: string } = {
        name: boxDetails.name.trim(),
        description: boxDetails.description.trim() || undefined,
        location_id: boxDetails.locationId,
        tags: boxDetails.tags
          ? boxDetails.tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t)
          : [],
        photos: capturedImage ? [capturedImage] : [],
        qr_code: qrData,
      };

      // Save to database
      const savedBox = await saveBox(boxData);

      if (savedBox) {
        setGeneratedQR(qrData);
        setStep("review");
        Alert.alert("Success", "Box created successfully!");
      } else {
        Alert.alert("Error", "Failed to create box. Please try again.");
      }
    } catch (error) {
      console.error("Error creating box:", error);
      Alert.alert("Error", "Failed to create box. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveBox = () => {
    // Reset form for next box
    setCapturedImage(null);
    setBoxDetails({ name: "", description: "", locationId: "", tags: "" });
    setGeneratedQR("");
    setStep("photo");
    Alert.alert(
      "Box Saved",
      "Box created successfully! You can now create another one."
    );
  };

  const renderPhotoStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="camera-outline" size={48} color="#2563eb" />
        <Text style={styles.stepTitle}>Step 1: Take Photo</Text>
        <Text style={styles.stepSubtitle}>
          Capture or select a photo of your box contents
        </Text>
      </View>

      {capturedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
              <Ionicons name="refresh" size={20} color="#666" />
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={proceedToDetails}
            >
              <Text style={styles.continueText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.photoButton} onPress={showImageOptions}>
          <Ionicons name="camera" size={48} color="#2563eb" />
          <Text style={styles.photoButtonText}>Add Photo</Text>
          <Text style={styles.photoButtonSubtext}>
            Tap to take or select photo
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="document-text-outline" size={48} color="#2563eb" />
        <Text style={styles.stepTitle}>Step 2: Box Details</Text>
        <Text style={styles.stepSubtitle}>
          Add information about your storage box
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Box Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Holiday Decorations"
            value={boxDetails.name}
            onChangeText={(text) =>
              setBoxDetails({ ...boxDetails, name: text })
            }
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional details about the box contents..."
            value={boxDetails.description}
            onChangeText={(text) =>
              setBoxDetails({ ...boxDetails, description: text })
            }
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., winter, clothes, seasonal (comma separated)"
            value={boxDetails.tags}
            onChangeText={(text) =>
              setBoxDetails({ ...boxDetails, tags: text })
            }
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Storage Location *</Text>
            <TouchableOpacity
              style={styles.addLocationButton}
              onPress={() => setShowNewLocationForm(true)}
            >
              <Ionicons name="add" size={16} color="#2563eb" />
              <Text style={styles.addLocationText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {showNewLocationForm ? (
            <View style={styles.newLocationForm}>
              <TextInput
                style={styles.input}
                placeholder="New location name"
                value={newLocationName}
                onChangeText={setNewLocationName}
              />
              <View style={styles.newLocationActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowNewLocationForm(false);
                    setNewLocationName("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateLocation}
                >
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.locationPicker}>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationOption,
                    boxDetails.locationId === location.id &&
                      styles.locationOptionSelected,
                  ]}
                  onPress={() =>
                    setBoxDetails({ ...boxDetails, locationId: location.id })
                  }
                >
                  <Ionicons
                    name={
                      boxDetails.locationId === location.id
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={20}
                    color={
                      boxDetails.locationId === location.id ? "#2563eb" : "#666"
                    }
                  />
                  <Text
                    style={[
                      styles.locationOptionText,
                      boxDetails.locationId === location.id &&
                        styles.locationOptionTextSelected,
                    ]}
                  >
                    {location.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formActions}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep("photo")}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isProcessing && styles.submitButtonDisabled,
            ]}
            onPress={handleDetailsSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.submitButtonText}>Creating...</Text>
              </>
            ) : (
              <>
                <Text style={styles.submitButtonText}>Generate QR Code</Text>
                <Ionicons name="qr-code" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
        <Text style={styles.stepTitle}>Box Created Successfully!</Text>
        <Text style={styles.stepSubtitle}>
          Your box has been saved and QR code generated
        </Text>
      </View>

      <View style={styles.reviewContent}>
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Box Details</Text>
          <View style={styles.reviewGrid}>
            <View style={styles.reviewDetails}>
              <Text style={styles.reviewLabel}>Name:</Text>
              <Text style={styles.reviewValue}>{boxDetails.name}</Text>

              <Text style={styles.reviewLabel}>Location:</Text>
              <Text style={styles.reviewValue}>
                {locations.find((l) => l.id === boxDetails.locationId)?.name ||
                  "Unknown"}
              </Text>

              {boxDetails.description && (
                <>
                  <Text style={styles.reviewLabel}>Description:</Text>
                  <Text style={styles.reviewValue}>
                    {boxDetails.description}
                  </Text>
                </>
              )}

              {boxDetails.tags && (
                <>
                  <Text style={styles.reviewLabel}>Tags:</Text>
                  <Text style={styles.reviewValue}>{boxDetails.tags}</Text>
                </>
              )}
            </View>

            {capturedImage && (
              <Image
                source={{ uri: capturedImage }}
                style={styles.reviewImage}
              />
            )}
          </View>
        </View>

        <View style={styles.qrSection}>
          <Text style={styles.reviewSectionTitle}>Your QR Code</Text>
          <View style={styles.qrContainer}>
            <QRCode value={generatedQR} size={200} />
            <Text style={styles.qrCodeText}>{generatedQR}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveBox}>
          <Text style={styles.saveButtonText}>Save & Create Another</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressStep,
            step !== "photo" && styles.progressStepComplete,
          ]}
        />
        <View
          style={[
            styles.progressStep,
            step === "review" && styles.progressStepComplete,
          ]}
        />
        <View style={styles.progressStep} />
      </View>

      {step === "photo" && renderPhotoStep()}
      {step === "details" && renderDetailsStep()}
      {step === "review" && renderReviewStep()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  progressBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
  },
  progressStepComplete: {
    backgroundColor: "#2563eb",
  },
  stepContainer: {
    padding: 20,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  imageContainer: {
    alignItems: "center",
  },
  capturedImage: {
    width: 300,
    height: 225,
    borderRadius: 12,
    marginBottom: 20,
  },
  imageActions: {
    flexDirection: "row",
    gap: 16,
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 8,
  },
  retakeText: {
    fontSize: 16,
    color: "#666",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  continueText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  photoButton: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  photoButtonSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  form: {
    backgroundColor: "white",
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
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addLocationText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  newLocationForm: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f0f9ff",
  },
  newLocationActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 14,
  },
  createButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  locationPicker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    maxHeight: 150,
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
  formActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  submitButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  reviewContent: {
    gap: 24,
  },
  reviewSection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  reviewGrid: {
    flexDirection: "row",
    gap: 16,
  },
  reviewDetails: {
    flex: 1,
  },
  reviewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
  },
  reviewImage: {
    width: 100,
    height: 75,
    borderRadius: 8,
  },
  qrSection: {
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
  qrContainer: {
    alignItems: "center",
    gap: 16,
  },
  qrCodeText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  saveButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});
