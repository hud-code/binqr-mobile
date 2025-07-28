import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator, Text } from "react-native";
import { useAuth } from "../context/AuthContext";

// Auth screens
import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";

// Main app tabs (we'll import this when we create it)
import MainTabs from "./MainTabs";

const Stack = createStackNavigator();

function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
      }}
    >
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
        Loading...
      </Text>
    </View>
  );
}

export default function AuthStack() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Authenticated screens
        <Stack.Screen name="MainApp" component={MainTabs} />
      ) : (
        // Auth screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
