import { useAuth, useUser } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAvatar from "../../components/UserAvatar";
import CustomSpinner from "../../components/CustomSpinner";
import { useTheme } from "../../context/ThemeContext";
import { useInAppNotification } from "../../context/NotificationContext";
import { sendLocalNotification } from "../../lib/notifications";
import { MESSAGES } from "../../constants/messages";

export default function SettingsScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();

  const { pushEnabled, setPushEnabled } = useInAppNotification();
  const [notificationBusy, setNotificationBusy] = useState(false);
  const changeNotifications = async (enabled: boolean) => {
    if (notificationBusy) return;
    setNotificationBusy(true);
    try { await setPushEnabled(enabled); } catch (error) { Alert.alert("Notifications", error instanceof Error ? error.message : "Unable to enable notifications."); }
    finally { setNotificationBusy(false); }
  };
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
    Alert.alert("Info", MESSAGES.GENERAL.UNDER_CONSTRUCTION(feature));
  };

  if (!isLoaded || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, alignItems: "center", justifyContent: "center" }}>
        <CustomSpinner size={40} color={theme.textMuted} />
      </SafeAreaView>
    );
  }

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
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 100 }}>
        {/* Profile Snapshot */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            borderWidth: 1,
            borderColor: theme.cardBorder,
          }}
        >
          <UserAvatar size={50} uri={user.imageUrl} name={`${user.firstName} ${user.lastName}`} email={user.primaryEmailAddress.emailAddress} />
          <View>
            <Text style={{ fontSize: 15, fontWeight: "700", color: theme.text }}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              {user.emailAddresses?.[0]?.emailAddress}
            </Text>
          </View>
        </View>

        {/* Section 1: App Preferences */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: theme.textSecondary, marginLeft: 4 }}>
            PREFERENCES
          </Text>
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              overflow: "hidden",
            }}
          >
            <SettingToggle
              icon="notifications"
              label={notificationBusy ? "Enabling notifications…" : "Phone Notifications"}
              value={pushEnabled}
              onValueChange={changeNotifications}
              theme={theme}
            />
            {pushEnabled && <SettingItem icon="notifications-outline" label="Send test notification" theme={theme} onPress={async () => { const result = await sendLocalNotification("Kribb notifications enabled", "You will receive a notification after adding a property."); if (!result?.sent) Alert.alert("Notifications", result?.reason || "Enable notifications in your phone settings."); }} />}
            <View style={{ height: 1, backgroundColor: theme.cardBorder, marginLeft: 16 }} />
            <SettingToggle
              icon="mail"
              label="Email Updates"
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              theme={theme}
            />
            <View style={{ height: 1, backgroundColor: theme.cardBorder, marginLeft: 16 }} />
            <SettingToggle
              icon="moon"
              label="Dark Mode"
              value={isDark}
              onValueChange={toggleTheme}
              theme={theme}
            />
          </View>
        </View>

        {/* Section 2: Security & Privacy */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: theme.textSecondary, marginLeft: 4 }}>
            SECURITY & PRIVACY
          </Text>
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              overflow: "hidden",
            }}
          >
            <SettingItem
              icon="lock-closed"
              label="Reset Password"
              onPress={() => router.push("/(root)/change-password")}
              theme={theme}
            />
            <View style={{ height: 1, backgroundColor: theme.cardBorder, marginLeft: 16 }} />
            <SettingItem
              icon="shield-checkmark"
              label="Privacy Settings"
              onPress={() => router.push("/(root)/privacy-settings")}
              theme={theme}
            />
          </View>
        </View>

        {/* Section 3: About */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: theme.textSecondary, marginLeft: 4 }}>
            ABOUT
          </Text>
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              overflow: "hidden",
            }}
          >
            <SettingItem
              icon="document-text"
              label="Terms of Service"
              onPress={() => router.push("/(root)/terms")}
              theme={theme}
            />
            <View style={{ height: 1, backgroundColor: theme.cardBorder, marginLeft: 16 }} />
            <SettingItem
              icon="key"
              label="Privacy Policy"
              onPress={() => router.push("/(root)/privacy-policy")}
              theme={theme}
            />
            <View style={{ height: 1, backgroundColor: theme.cardBorder, marginLeft: 16 }} />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Ionicons name="information-circle" size={20} color={theme.textSecondary} />
                <Text style={{ fontSize: 14, fontWeight: "500", color: theme.text }}>
                  App Version
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: theme.textMuted }}>v1.0.0</Text>
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
            backgroundColor: theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
            borderWidth: 1,
            borderColor: theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
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
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  theme: any;
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
        <Ionicons name={icon} size={20} color={theme.textSecondary} />
        <Text style={{ fontSize: 14, fontWeight: "500", color: theme.text }}>
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

function SettingToggle({
  icon,
  label,
  value,
  onValueChange,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  theme: any;
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
        <Ionicons name={icon} size={20} color={theme.textSecondary} />
        <Text style={{ fontSize: 14, fontWeight: "500", color: theme.text }}>
          {label}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.cardBorder, true: theme.accentLight }}
        thumbColor={value ? theme.accent : theme.textMuted}
      />
    </View>
  );
}
