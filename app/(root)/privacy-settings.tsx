import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const privacyItems = [
    {
      icon: "eye-off" as const,
      title: "Profile Visibility",
      desc: "Control who can see your profile information",
    },
    {
      icon: "location-outline" as const,
      title: "Location Sharing",
      desc: "Manage how your location data is used",
    },
    {
      icon: "analytics-outline" as const,
      title: "Analytics & Data",
      desc: "Choose what usage data is collected",
    },
    {
      icon: "trash-outline" as const,
      title: "Delete Account",
      desc: "Permanently remove your account and data",
      danger: true,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: theme.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.cardBorder,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.sectionBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>
          Privacy Settings
        </Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {privacyItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={{
              backgroundColor: theme.card,
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              borderWidth: 1,
              borderColor: item.danger ? "rgba(239,68,68,0.2)" : theme.cardBorder,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: item.danger ? "rgba(239,68,68,0.1)" : theme.accentLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={item.icon} size={22} color={item.danger ? "#EF4444" : theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: item.danger ? "#EF4444" : theme.text }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                {item.desc}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        ))}

        <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: "center", marginTop: 16, paddingHorizontal: 20, lineHeight: 18 }}>
          These settings control how your personal data is handled within Kribb. Changes may take a few moments to apply.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
