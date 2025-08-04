import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
  const { profile, signOut } = useAuth();
  const { theme, themeMode } = useTheme();
  const navigation = useNavigation();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile" as never);
  };

  const handleNotifications = () => {
    Alert.alert("Coming Soon", "Notification settings will be available in a future update.");
  };

  const handlePrivacySecurity = () => {
    Alert.alert("Coming Soon", "Privacy & Security settings will be available in a future update.");
  };

  const handleBackupSync = () => {
    Alert.alert("Coming Soon", "Backup & Sync features will be available in a future update.");
  };

  const handleHelpSupport = () => {
    Alert.alert("Help & Support", "For support, please email: support@binqr.app");
  };

  const handleAbout = () => {
    Alert.alert(
      "About BinQR",
      "BinQR helps you organize and track your storage boxes using QR codes.\n\nVersion 1.0.0\n\nMade with ❤️ for better organization."
    );
  };

  const handleAppearance = () => {
    navigation.navigate("ThemeSettings" as never);
  };

  const getThemeModeLabel = () => {
    switch (themeMode) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "System";
    }
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
    profileHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    avatarText: {
      color: "white",
      fontSize: 24,
      fontWeight: "bold",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: 30,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingText: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 12,
      flex: 1,
    },
    settingWithValue: {
      flex: 1,
      marginLeft: 12,
    },
    settingValue: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    signOutItem: {
      borderBottomWidth: 0,
    },
    signOutText: {
      color: theme.colors.error,
    },
    version: {
      textAlign: "center",
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginTop: 20,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              {profile?.avatar_url ? (
                <Image 
                  source={{ uri: profile.avatar_url }} 
                  style={styles.avatarImage} 
                />
              ) : (
                <Text style={styles.avatarText}>
                  {profile?.full_name?.charAt(0)?.toUpperCase() ||
                    profile?.email?.charAt(0)?.toUpperCase() ||
                    "U"}
                </Text>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.full_name || "User"}
              </Text>
              <Text style={styles.profileEmail}>{profile?.email}</Text>
            </View>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
            <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.settingText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleNotifications}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.settingText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacySecurity}>
            <Ionicons name="lock-closed-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleAppearance}>
            <Ionicons name="color-palette-outline" size={24} color={theme.colors.primary} />
            <View style={styles.settingWithValue}>
              <Text style={[styles.settingText, { color: theme.colors.text, marginLeft: 0 }]}>Appearance</Text>
              <Text style={styles.settingValue}>
                {getThemeModeLabel()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleBackupSync}>
            <Ionicons name="cloud-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.settingText}>Backup & Sync</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingItem} onPress={handleHelpSupport}>
            <Ionicons name="help-circle-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.settingText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.settingText}>About</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.settingItem, styles.signOutItem]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
            <Text style={[styles.settingText, styles.signOutText]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}


