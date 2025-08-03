import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "../context/ThemeContext";
import HomeScreen from "../screens/HomeScreen";
import BoxDetailsScreen from "../screens/BoxDetailsScreen";
import type { Box } from "../lib/types";

export type HomeStackParamList = {
  HomeMain: undefined;
  BoxDetails: { box: Box };
};

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.shadow,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
          color: theme.colors.text,
        },
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ 
          headerShown: false // Hide header since tab navigator already shows it
        }} 
      />
      <Stack.Screen 
        name="BoxDetails" 
        component={BoxDetailsScreen} 
        options={{ 
          title: "Box Details",
          headerBackTitleVisible: false,
        }} 
      />
    </Stack.Navigator>
  );
}