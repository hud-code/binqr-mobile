import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { getBoxByQRCode } from "../lib/database";
import type { Box } from "../lib/types";

export default function ScanScreen() {
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [foundBox, setFoundBox] = useState<Box | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setIsLookingUp(true);

    try {
      // Only process BinQR codes (should start with "BinQR:")
      if (!data.startsWith("BinQR:")) {
        Alert.alert(
          "QR Code Scanned",
          `Code: ${data}\n\nThis doesn't appear to be a BinQR box code. BinQR codes start with "BinQR:".`,
          [{ text: "Scan Again", onPress: resetScanner }]
        );
        setIsLookingUp(false);
        return;
      }

      // Look up the box in the database
      const box = await getBoxByQRCode(data);

      if (box) {
        setFoundBox(box);
        Alert.alert("Box Found!", `Found: ${box.name}`, [
          { text: "View Details", onPress: () => {} },
          { text: "Scan Again", onPress: resetScanner },
        ]);
      } else {
        Alert.alert(
          "BinQR Code Not Found",
          `This appears to be a valid BinQR code, but the box wasn't found in your collection.\n\nCode: ${data}`,
          [{ text: "Scan Again", onPress: resetScanner }]
        );
      }
    } catch (error) {
      console.error("Error looking up QR code:", error);
      Alert.alert("Error", "Failed to look up the QR code. Please try again.", [
        { text: "Scan Again", onPress: resetScanner },
      ]);
    } finally {
      setIsLookingUp(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setFoundBox(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const styles = createStyles(theme);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color={theme.colors.placeholder} />
        <Text style={styles.text}>No access to camera</Text>
        <Text style={styles.subText}>
          Please enable camera permissions in your device settings to scan QR
          codes.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (foundBox) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.boxDetailsContainer}>
          <View style={styles.boxHeader}>
            <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
            <Text style={styles.foundTitle}>Box Found!</Text>
          </View>

          <View style={styles.boxCard}>
            <View style={styles.boxMainInfo}>
              <Text style={styles.boxName}>{foundBox.name}</Text>
              {foundBox.description && (
                <Text style={styles.boxDescription}>
                  {foundBox.description}
                </Text>
              )}
            </View>

            {foundBox.photo_urls.length > 0 && (
              <Image
                source={{ uri: foundBox.photo_urls[0] }}
                style={styles.boxImage}
              />
            )}
          </View>

          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Details</Text>

            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color={theme.colors.primary} />
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>
                {foundBox.location?.name || "Unknown Location"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="qr-code" size={20} color={theme.colors.primary} />
              <Text style={styles.detailLabel}>QR Code:</Text>
              <Text style={styles.detailValue}>{foundBox.qr_code}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              <Text style={styles.detailLabel}>Created:</Text>
              <Text style={styles.detailValue}>
                {formatDate(foundBox.created_at)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color={theme.colors.primary} />
              <Text style={styles.detailLabel}>Updated:</Text>
              <Text style={styles.detailValue}>
                {formatDate(foundBox.updated_at)}
              </Text>
            </View>
          </View>

          {foundBox.tags.length > 0 && (
            <View style={styles.tagsCard}>
              <Text style={styles.detailsTitle}>Contents</Text>
              <View style={styles.tagsContainer}>
                {foundBox.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={20} color={theme.colors.primary} />
              <Text style={styles.editButtonText}>Edit Box</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={resetScanner}
            >
              <Ionicons name="scan" size={20} color="white" />
              <Text style={styles.scanAgainButtonText}>Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
      />

      {/* Overlay positioned absolutely over the camera */}
      <View style={styles.overlay}>
        <View style={styles.scanArea}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <Text style={styles.instructionText}>
          Position QR code within the frame
        </Text>

        {isLookingUp && (
          <View style={styles.lookupContainer}>
            <Text style={styles.lookupText}>Looking up box...</Text>
          </View>
        )}

        {scanned && !isLookingUp && (
          <TouchableOpacity style={styles.rescanButton} onPress={resetScanner}>
            <Text style={styles.rescanText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  scanArea: {
    width: 250,
    height: 250,
    position: "relative",
    marginBottom: 40,
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#fff",
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    left: "auto",
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    top: "auto",
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: "auto",
    left: "auto",
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  lookupContainer: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  lookupText: {
    color: "#fff",
    fontSize: 16,
  },
  rescanButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  rescanText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  text: {
    fontSize: 18,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  boxDetailsContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  boxHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  foundTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#16a34a",
    marginTop: 12,
  },
  boxCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    gap: 16,
  },
  boxMainInfo: {
    flex: 1,
  },
  boxName: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 8,
  },
  boxDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  boxImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  detailsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  tagsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: "#2563eb",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderColor: "#2563eb",
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "600",
  },
  scanAgainButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  scanAgainButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});
