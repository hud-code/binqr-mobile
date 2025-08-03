import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SettingsScreen from "../screens/SettingsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";

export type SettingsStackParamList = {
  SettingsMain: undefined;
  EditProfile: undefined;
};

const Stack = createStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsScreen} 
        options={{ 
          headerShown: false // Hide header since tab navigator already shows it
        }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ 
          title: "Edit Profile",
          headerBackTitleVisible: false,
        }} 
      />
    </Stack.Navigator>
  );
}