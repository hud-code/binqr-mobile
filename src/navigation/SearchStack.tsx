import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SearchScreen from "../screens/SearchScreen";
import BoxDetailsScreen from "../screens/BoxDetailsScreen";
import type { Box } from "../lib/types";

export type SearchStackParamList = {
  SearchMain: undefined;
  BoxDetails: { box: Box };
};

const Stack = createStackNavigator<SearchStackParamList>();

export default function SearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SearchMain" 
        component={SearchScreen} 
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