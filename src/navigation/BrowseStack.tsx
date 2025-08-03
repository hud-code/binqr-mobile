import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "../context/ThemeContext";
import BrowseScreen from "../screens/BrowseScreen";
import BoxDetailsScreen from "../screens/BoxDetailsScreen";
import type { Box } from "../lib/types";

export type BrowseStackParamList = {
  BrowseMain: undefined;
  BoxDetails: { box: Box };
};

const Stack = createStackNavigator<BrowseStackParamList>();

export default function BrowseStack() {
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
        name="BrowseMain" 
        component={BrowseScreen} 
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