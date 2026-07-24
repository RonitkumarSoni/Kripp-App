import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "info" | "success" | "warning";
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Welcome to Kribb!",
    body: "Start exploring premium properties in Mumbai, Delhi, and Bangalore today.",
    time: "2 hours ago",
    type: "info",
    read: false,
  },
  {
    id: "2",
    title: "New Camera Feature Launched 📸",
    body: "You can now snap real-time photos of your properties directly using your camera when listing.",
    time: "1 day ago",
    type: "success",
    read: false,
  },
  {
    id: "3",
    title: "Property Saved Successfully",
    body: "You added 'Modern Luxury Villa' to your saved list. You can view all saved properties anytime in the Saved tab.",
    time: "2 days ago",
    type: "success",
    read: true,
  },
];

export default function NotificationScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#10B981" };
      case "warning":
        return { name: "alert-circle", color: "#F59E0B" };
      default:
        return { name: "information-circle", color: "#3B82F6" };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
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
            Notifications
          </Text>
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#2563EB" }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => {
          const icon = getIcon(item.type);
          return (
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 16,
                gap: 12,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                opacity: item.read ? 0.75 : 1,
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
                    color: "#111827",
                    marginBottom: 4,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "#4B5563",
                    lineHeight: 18,
                    marginBottom: 6,
                  }}
                >
                  {item.body}
                </Text>
                <Text style={{ fontSize: 10, color: "#9CA3AF" }}>
                  {item.time}
                </Text>
              </View>
              {!item.read && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#3B82F6",
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
              color="#9CA3AF"
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#4B5563",
                marginTop: 16,
              }}
            >
              No notifications yet
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#9CA3AF",
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
