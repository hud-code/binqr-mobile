import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import BoxDetailsScreen from "../screens/BoxDetailsScreen";
import type { Box } from "../lib/types";

export type HomeStackParamList = {
  HomeMain: undefined;
  BoxDetails: { box: Box };
};

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator>
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