import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, ThemeMode } from "../context/ThemeContext";

const themeOptions: { mode: ThemeMode; label: string; description: string; icon: string }[] = [
  {
    mode: "light",
    label: "Light",
    description: "Always use light theme",
    icon: "sunny",
  },
  {
    mode: "dark", 
    label: "Dark",
    description: "Always use dark theme",
    icon: "moon",
  },
  {
    mode: "system",
    label: "System",
    description: "Follow system settings",
    icon: "phone-portrait",
  },
];

export default function ThemeSettingsScreen({ navigation }: any) {
  const { theme, themeMode, setThemeMode } = useTheme();

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 20,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 20,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      padding: 20,
      paddingBottom: 12,
    },
    themeOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    lastOption: {
      borderBottomWidth: 0,
    },
    themeIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    themeInfo: {
      flex: 1,
    },
    themeLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 2,
    },
    themeDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    selectedIndicator: {
      marginLeft: 12,
    },
    previewSection: {
      padding: 20,
    },
    previewTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 16,
    },
    previewCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    previewText: {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 8,
    },
    previewSecondaryText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          {themeOptions.map((option, index) => (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.themeOption,
                index === themeOptions.length - 1 && styles.lastOption,
              ]}
              onPress={() => handleThemeChange(option.mode)}
            >
              <View style={styles.themeIcon}>
                <Ionicons 
                  name={option.icon as any} 
                  size={20} 
                  color={theme.colors.primary} 
                />
              </View>
              
              <View style={styles.themeInfo}>
                <Text style={styles.themeLabel}>{option.label}</Text>
                <Text style={styles.themeDescription}>{option.description}</Text>
              </View>
              
              <View style={styles.selectedIndicator}>
                <Ionicons
                  name={themeMode === option.mode ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={themeMode === option.mode ? theme.colors.primary : theme.colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewText}>
                This is how text appears in the current theme
              </Text>
              <Text style={styles.previewSecondaryText}>
                Secondary text is lighter and used for descriptions
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}