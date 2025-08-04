import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";

export default function EditProfileScreen({ navigation }: any) {
  const { profile, refreshProfile } = useAuth();
  const { theme } = useTheme();
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setProfileImage(profile.avatar_url || null);
    }
  }, [profile]);

  const handleUpdateImage = async () => {
    Alert.alert(
      "Update Profile Picture",
      "Choose how you want to update your profile picture",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setIsSaving(true);

    try {
      // Update profile in database
      console.log(
        "Updating profile directly for user:",
        profile?.id,
        "with data:",
        {
          full_name: fullName.trim(),
          avatar_url: profileImage,
        }
      );

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          avatar_url: profileImage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile?.id);

      if (profileError) throw profileError;

      // Refresh profile data
      await refreshProfile();

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Change Password",
      "You will receive an email with instructions to reset your password.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Email",
          onPress: async () => {
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(
                profile?.email || email
              );

              if (error) throw error;

              Alert.alert(
                "Email Sent",
                "Check your inbox for password reset instructions."
              );
            } catch (error) {
              Alert.alert("Error", "Failed to send password reset email.");
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>

          {/* Profile Picture */}
          <View style={styles.profileImageSection}>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons
                    name="person"
                    size={40}
                    color={theme.colors.placeholder}
                  />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.updateImageButton}
              onPress={handleUpdateImage}
            >
              <Ionicons name="camera" size={16} color={theme.colors.primary} />
              <Text style={styles.updateImageText}>Update Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{profile?.email}</Text>
              <Ionicons
                name="lock-closed"
                size={16}
                color={theme.colors.placeholder}
              />
            </View>
            <Text style={styles.helperText}>
              Email cannot be changed as it's your login credential
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleChangePassword}
          >
            <Ionicons
              name="key-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.settingText}>Change Password</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.placeholder}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
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
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
    },
    helperText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    profileImageSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    profileImageContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      overflow: "hidden",
      marginBottom: 12,
    },
    profileImage: {
      width: "100%",
      height: "100%",
    },
    placeholderImage: {
      width: "100%",
      height: "100%",
      backgroundColor: theme.colors.disabled,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: "dashed",
    },
    updateImageButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 6,
      gap: 6,
    },
    updateImageText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: "500",
    },
    readOnlyField: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      backgroundColor: theme.colors.background,
    },
    readOnlyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
    },
    settingText: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 12,
      flex: 1,
    },
    buttonContainer: {
      gap: 12,
      marginTop: 20,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 8,
      gap: 8,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.disabled,
    },
    saveButtonText: {
      color: theme.colors.surface,
      fontSize: 16,
      fontWeight: "600",
    },
    cancelButton: {
      backgroundColor: theme.colors.disabled,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    cancelButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      fontWeight: "600",
    },
  });
