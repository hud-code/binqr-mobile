import "react-native-get-random-values";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

// Auth
import { AuthProvider } from "./src/context/AuthContext";
import AuthStack from "./src/navigation/AuthStack";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AuthStack />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
