import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useInAppNotification, type NotificationItem } from "../../context/NotificationContext";
import { useTheme } from "../../context/ThemeContext";

export default function NotificationScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { notifications, markAllAsRead, clearAll } = useInAppNotification();

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#10B981" };
      case "error":
      case "warning":
        return { name: "alert-circle", color: "#F59E0B" };
      default:
        return { name: "information-circle", color: theme.accent };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: theme.bg,
          borderBottomWidth: 1,
          borderBottomColor: theme.cardBorder,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.inputBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>
            Notifications
          </Text>
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: theme.accent }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
        renderItem={({ item }) => {
          const icon = getIcon(item.type || "info");
          return (
            <View
              style={{
                flexDirection: "row",
                backgroundColor: theme.card,
                borderRadius: 16,
                padding: 16,
                gap: 12,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                opacity: item.read ? 0.6 : 1,
                position: "relative",
              }}
            >
              <Ionicons
                name={icon.name as any}
                size={24}
                color={icon.color}
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: item.read ? "600" : "700",
                    color: theme.text,
                    marginBottom: 4,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    lineHeight: 18,
                    marginBottom: 6,
                  }}
                >
                  {item.body}
                </Text>
                <Text style={{ fontSize: 10, color: theme.textMuted }}>
                  {new Date(item.time).toLocaleString()}
                </Text>
              </View>
              {!item.read && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.accent,
                    position: "absolute",
                    top: 16,
                    right: 16,
                  }}
                />
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 120,
            }}
          >
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color={theme.textMuted}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: theme.textSecondary,
                marginTop: 16,
              }}
            >
              No notifications yet
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: theme.textMuted,
                marginTop: 4,
                textAlign: "center",
                paddingHorizontal: 32,
              }}
            >
              We'll notify you when something important happens!
            </Text>
          </View>
        }
        ListFooterComponent={
          notifications.length > 0 ? (
            <TouchableOpacity
              onPress={clearAll}
              style={{
                alignItems: "center",
                paddingVertical: 12,
                marginTop: 16,
              }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#EF4444" }}
              >
                Clear all notifications
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
