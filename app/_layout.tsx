import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { ThemeProvider, useTheme } from "../utils/theme";

function TabsLayout() {
  const { theme } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        // Tab Bar Styling (per style guide) - Monochrome design
        tabBarActiveTintColor: theme.colors.text.primary,
        tabBarInactiveTintColor: theme.colors.text.muted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 83, // 49pt + 34pt safe area as per style guide
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500', // Medium weight as per style guide
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        // Header Styling (per style guide)  
        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.colors.text.primary,
        },
        headerShadowVisible: false, // Clean look per monochrome design
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "Ninja Track",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false, // Let the stack navigation handle headers
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabsLayout />
    </ThemeProvider>
  );
}
