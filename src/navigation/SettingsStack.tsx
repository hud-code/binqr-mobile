import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SettingsScreen from "../screens/SettingsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ThemeSettingsScreen from "../screens/ThemeSettingsScreen";
import { useTheme } from "../context/ThemeContext";

export type SettingsStackParamList = {
  SettingsMain: undefined;
  EditProfile: undefined;
  ThemeSettings: undefined;
  LoginViewer: undefined;
  LoginTester: undefined;
  LoginFlowGuide: undefined;
};

const Stack = createStackNavigator<SettingsStackParamList>();

// Admin screens are only required in development to keep mock tooling out of prod bundles when possible
const LoginViewerScreen = __DEV__
  ? require("../screens/admin/LoginViewerScreen").default
  : null;
const LoginTesterScreen = __DEV__
  ? require("../screens/admin/LoginTesterScreen").default
  : null;
const LoginFlowGuideScreen = __DEV__
  ? require("../screens/admin/LoginFlowGuideScreen").default
  : null;

export default function SettingsStack() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
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
      <Stack.Screen 
        name="ThemeSettings" 
        component={ThemeSettingsScreen} 
        options={{ 
          title: "Appearance",
          headerBackTitleVisible: false,
        }} 
      />
      {__DEV__ && LoginViewerScreen && (
        <Stack.Screen 
          name="LoginViewer" 
          component={LoginViewerScreen} 
          options={{ 
            title: "Login Page Viewer",
            headerBackTitleVisible: false,
          }} 
        />
      )}
      {__DEV__ && LoginTesterScreen && (
        <Stack.Screen 
          name="LoginTester" 
          component={LoginTesterScreen} 
          options={{ 
            title: "Login Service Tester",
            headerBackTitleVisible: false,
          }} 
        />
      )}
      {__DEV__ && LoginFlowGuideScreen && (
        <Stack.Screen 
          name="LoginFlowGuide" 
          component={LoginFlowGuideScreen} 
          options={{ 
            title: "Login Flow Guide",
            headerBackTitleVisible: false,
          }} 
        />
      )}
    </Stack.Navigator>
  );
}
