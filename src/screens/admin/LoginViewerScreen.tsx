import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import LoginScreen from "../auth/LoginScreen";

export default function LoginViewerScreen() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
    },
    subHeader: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: 4,
    },
    warningBanner: {
      backgroundColor: theme.colors.warning || "#f59e0b",
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    warningText: {
      color: "white",
      fontWeight: "600",
      marginLeft: 8,
    },
    loginContainer: {
      flex: 1,
      pointerEvents: "none", // Makes the login screen non-interactive
      opacity: 0.8,
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "transparent",
      zIndex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Login Page Preview</Text>
        <Text style={styles.subHeader}>Admin Testing View - Read Only</Text>
      </View>

      <View style={styles.warningBanner}>
        <Ionicons name="warning" size={20} color="white" />
        <Text style={styles.warningText}>
          This is a preview of the user login page
        </Text>
      </View>

      <View style={styles.loginContainer}>
        <LoginScreen />
        <View style={styles.overlay} />
      </View>
    </View>
  );
}