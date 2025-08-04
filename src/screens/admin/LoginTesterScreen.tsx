import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { MockAuthService } from "../../lib/admin";

export default function LoginTesterScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const testAccounts = MockAuthService.getTestAccounts();

  const handleTestLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const { data, error } = await MockAuthService.mockSignIn(email, password);
      const duration = Date.now() - startTime;

      const result = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        email,
        password: password.replace(/./g, "*"), // Hide password in results
        success: !error,
        error: error?.message,
        duration,
        data: data ? "Mock user data returned" : null,
      };

      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results

      if (error) {
        Alert.alert("Login Failed", error.message);
      } else {
        Alert.alert("Login Success", "Mock login was successful!");
      }
    } catch (err) {
      Alert.alert("Error", "Test failed unexpectedly");
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestAccount = (account: { email: string; password: string }) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
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
      marginBottom: 12,
    },
    inputContainer: {
      marginBottom: 12,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
    },
    testButton: {
      backgroundColor: theme.colors.primary,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
      borderRadius: 8,
      marginTop: 8,
      gap: 8,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.disabled,
    },
    buttonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    accountButton: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    accountText: {
      color: theme.colors.text,
      fontSize: 14,
    },
    passwordText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    resultItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingVertical: 12,
      paddingBottom: 12,
    },
    resultHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    resultTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    resultStatus: {
      fontSize: 12,
      fontWeight: "600",
    },
    successStatus: {
      color: "#10b981",
    },
    errorStatus: {
      color: theme.colors.error,
    },
    resultDetails: {
      fontSize: 13,
      color: theme.colors.text,
      marginTop: 4,
    },
    resultError: {
      fontSize: 12,
      color: theme.colors.error,
      marginTop: 2,
      fontStyle: "italic",
    },
    clearButton: {
      backgroundColor: theme.colors.error,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 16,
    },
    clearButtonText: {
      color: "white",
      fontWeight: "600",
    },
    noResults: {
      textAlign: "center",
      color: theme.colors.textSecondary,
      fontStyle: "italic",
      padding: 20,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Test Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Login Service Tester</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email to test"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password to test"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.testButton, isLoading && styles.buttonDisabled]}
              onPress={handleTestLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.buttonText}>Testing...</Text>
              ) : (
                <>
                  <Ionicons name="flask-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>Test Login</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Test Accounts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Fill Test Accounts</Text>
            {testAccounts.map((account, index) => (
              <TouchableOpacity
                key={index}
                style={styles.accountButton}
                onPress={() => fillTestAccount(account)}
              >
                <View>
                  <Text style={styles.accountText}>{account.email}</Text>
                  <Text style={styles.passwordText}>Password: {account.password}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Test Results */}
          <View style={styles.section}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>Test Results</Text>
              {testResults.length > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {testResults.length === 0 ? (
              <Text style={styles.noResults}>No test results yet</Text>
            ) : (
              testResults.map((result) => (
                <View key={result.id} style={styles.resultItem}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultTime}>{result.timestamp}</Text>
                    <Text style={[
                      styles.resultStatus,
                      result.success ? styles.successStatus : styles.errorStatus
                    ]}>
                      {result.success ? "SUCCESS" : "FAILED"}
                    </Text>
                  </View>
                  <Text style={styles.resultDetails}>
                    {result.email} • {result.duration}ms
                  </Text>
                  {result.error && (
                    <Text style={styles.resultError}>{result.error}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}