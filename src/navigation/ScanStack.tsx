import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "../context/ThemeContext";
import ScanScreen from "../screens/ScanScreen";
import BoxDetailsScreen from "../screens/BoxDetailsScreen";
import type { Box } from "../lib/types";

export type ScanStackParamList = {
  ScanMain: undefined;
  BoxDetails: { box: Box };
};

const Stack = createStackNavigator<ScanStackParamList>();

export default function ScanStack() {
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
        name="ScanMain"
        component={ScanScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BoxDetails"
        component={BoxDetailsScreen}
        options={{
          title: "Box Details",
          headerBackTitle: "",
        }}
      />
    </Stack.Navigator>
  );
}
