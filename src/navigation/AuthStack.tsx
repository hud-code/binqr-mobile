import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator, Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// Auth screens
import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import EmailVerificationScreen from "../screens/auth/EmailVerificationScreen";

// Onboarding screens
import GuidedStepsScreen from "../screens/onboarding/GuidedStepsScreen";

// Main app tabs (we'll import this when we create it)
import MainTabs from "./MainTabs";

const Stack = createStackNavigator();

function LoadingScreen() {
  const { theme } = useTheme();
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ 
        marginTop: 16, 
        fontSize: 16, 
        color: theme.colors.textSecondary 
      }}>
        Loading...
      </Text>
    </View>
  );
}

export default function AuthStack() {
  const { isAuthenticated, isLoading, isEmailVerified, needsOnboarding } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {isAuthenticated ? (
        // User is authenticated, check email verification and onboarding status
        <>
          {!isEmailVerified ? (
            // User is signed up but email not verified
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
          ) : needsOnboarding ? (
            // Email verified but needs onboarding
            <Stack.Screen name="GuidedSteps" component={GuidedStepsScreen} />
          ) : (
            // Fully authenticated and onboarded
            <Stack.Screen name="MainApp" component={MainTabs} />
          )}
        </>
      ) : (
        // Not authenticated - show auth screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
          <Stack.Screen name="GuidedSteps" component={GuidedStepsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
