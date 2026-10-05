import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../../../context/ThemeContext";

const TabItem = ({
  name,
  label,
  focused,
  theme,
}: {
  name: string;
  label: string;
  focused: boolean;
  theme: any;
}) => {
  const iconName = focused ? name : `${name}-outline`;

  React.useEffect(() => {
    if (focused) {
      try {
        const Haptics = require("expo-haptics");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  }, [focused]);

  return (
    <View
      style={{
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: focused ? theme.accentLight : "transparent",
          borderRadius: 20,
          paddingHorizontal: focused ? 14 : 8,
          paddingVertical: 4,
          minWidth: 48,
        }}
      >
        <Ionicons
          name={iconName as any}
          size={20}
          color={focused ? theme.accent : theme.textMuted}
        />
        <Text
          style={{
            color: focused ? theme.accent : theme.textMuted,
            fontSize: 9,
            fontWeight: focused ? "700" : "500",
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </View>
  );
};

export default function TabLayout() {
  const { theme, isDark } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "none",
        tabBarShowLabel: false,
        tabBarBackground: () => (
          <View
            style={{
              flex: 1,
              borderRadius: 30,
              overflow: "hidden",
              borderWidth: 0.5,
              borderColor: theme.tabBarBorder,
            }}
          >
            {Platform.OS === "android" ? <View style={{ flex: 1, backgroundColor: theme.tabBarBg }} /> : <BlurView
              tint={isDark ? "dark" : "light"}
              intensity={85}
              style={{
                flex: 1,
                backgroundColor: Platform.OS === "web"
                  ? theme.tabBarBg
                  : "transparent",
              }}
            />}
          </View>
        ),
        tabBarStyle: {
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
          elevation: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 14,
          borderTopWidth: 0,
          backgroundColor: "transparent",
          borderRadius: 30,
          height: 58,
          paddingHorizontal: 8,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 0,
          paddingBottom: 0,
          marginTop: 0,
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabItem name="home" label="Home" focused={focused} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => (
            <TabItem name="search" label="Search" focused={focused} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ focused }) => (
            <TabItem name="add-circle" label="Create" focused={focused} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused }) => (
            <TabItem name="heart" label="Saved" focused={focused} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabItem name="person" label="Profile" focused={focused} theme={theme} />
          ),
        }}
      />
      <Tabs.Screen
        name="property"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}