import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from "react-native";
import CustomSpinner from "../../../components/CustomSpinner";

export default function SettingsScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  // Mock settings states
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUnderConstruction = (feature: string) => {
    Alert.alert("Info", `${feature} settings will be synced with your device preferences.`);
  };

  if (!isLoaded || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB", alignItems: "center", justifyContent: "center" }}>
        <CustomSpinner size={40} color="#64748b" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#F3F4F6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        {/* Profile Snapshot */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "#2563EB",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "700" }}>
              {user.firstName ? user.firstName[0] : "U"}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
              {user.emailAddresses?.[0]?.emailAddress}
            </Text>
          </View>
        </View>

        {/* Section 1: App Preferences */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#6B7280", marginLeft: 4 }}>
            PREFERENCES
          </Text>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            <SettingToggle
              icon="notifications"
              label="Push Notifications"
              value={pushEnabled}
              onValueChange={setPushEnabled}
            />
            <View style={{ height: 1, backgroundColor: "#F3F4F6", marginLeft: 16 }} />
            <SettingToggle
              icon="mail"
              label="Email Updates"
              value={emailUpdates}
              onValueChange={setEmailUpdates}
            />
            <View style={{ height: 1, backgroundColor: "#F3F4F6", marginLeft: 16 }} />
            <SettingToggle
              icon="moon"
              label="Dark Mode"
              value={darkMode}
              onValueChange={(val) => {
                setDarkMode(val);
                handleUnderConstruction("Dark Mode");
              }}
            />
          </View>
        </View>

        {/* Section 2: Security & Privacy */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#6B7280", marginLeft: 4 }}>
            SECURITY & PRIVACY
          </Text>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            <SettingItem
              icon="lock-closed"
              label="Change Password"
              onPress={() => handleUnderConstruction("Password Management")}
            />
            <View style={{ height: 1, backgroundColor: "#F3F4F6", marginLeft: 16 }} />
            <SettingItem
              icon="shield-checkmark"
              label="Privacy Settings"
              onPress={() => handleUnderConstruction("Privacy Control")}
            />
          </View>
        </View>

        {/* Section 3: About */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#6B7280", marginLeft: 4 }}>
            ABOUT
          </Text>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            <SettingItem
              icon="document-text"
              label="Terms of Service"
              onPress={() => Alert.alert("Terms of Service", "TOS details go here.")}
            />
            <View style={{ height: 1, backgroundColor: "#F3F4F6", marginLeft: 16 }} />
            <SettingItem
              icon="key"
              label="Privacy Policy"
              onPress={() => Alert.alert("Privacy Policy", "Privacy policy details go here.")}
            />
            <View style={{ height: 1, backgroundColor: "#F3F4F6", marginLeft: 16 }} />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Ionicons name="information-circle" size={20} color="#6B7280" />
                <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>
                  App Version
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: "#9CA3AF" }}>v1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: "#FEF2F2",
            borderWidth: 1,
            borderColor: "#FEE2E2",
            borderRadius: 20,
            paddingVertical: 14,
            marginTop: 10,
          }}
        >
          <Ionicons name="log-out" size={20} color="#EF4444" />
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#EF4444" }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Ionicons name={icon} size={20} color="#4B5563" />
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

function SettingToggle({
  icon,
  label,
  value,
  onValueChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Ionicons name={icon} size={20} color="#4B5563" />
        <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>
          {label}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E5E7EB", true: "#93C5FD" }}
        thumbColor={value ? "#2563EB" : "#F3F4F6"}
      />
    </View>
  );
}