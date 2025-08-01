import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Screens
import HomeScreen from "../screens/HomeScreen";
import CreateScreen from "../screens/CreateScreen";
import ScanScreen from "../screens/ScanScreen";
import SearchScreen from "../screens/SearchScreen";
import LocationsScreen from "../screens/LocationsScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Create":
              iconName = focused ? "add-circle" : "add-circle-outline";
              break;
            case "Scan":
              iconName = focused ? "scan" : "scan-outline";
              break;
            case "Search":
              iconName = focused ? "search" : "search-outline";
              break;
            case "Locations":
              iconName = focused ? "location" : "location-outline";
              break;
            case "Settings":
              iconName = focused ? "settings" : "settings-outline";
              break;
            default:
              iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
        headerStyle: {
          backgroundColor: "#f9f9f9",
        },
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "BinQR" }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{ title: "Create Box" }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{ title: "Scan QR" }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: "Search" }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsScreen}
        options={{ title: "Locations" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </Tab.Navigator>
  );
}
