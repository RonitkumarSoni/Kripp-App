import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useTheme } from "../../../context/ThemeContext";

export default function MapScreen() {
  const { latitude, longitude, title, address } = useLocalSearchParams<{
    latitude: string;
    longitude: string;
    title: string;
    address: string;
  }>();
  const router = useRouter();
  const { theme } = useTheme();

  const lat = parseFloat(latitude || "17.4065");
  const lng = parseFloat(longitude || "78.4772");

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    lng - 0.001
  }%2C${lat - 0.001}%2C${lng + 0.001}%2C${
    lat + 0.001
  }&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View style={{ borderBottomColor: theme.cardBorder }} className="flex-row items-center justify-between px-4 py-3 border-b">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: theme.inputBg }}
          className="w-9 h-9 items-center justify-center rounded-full"
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>

        <View className="flex-1 mx-3">
          <Text
            style={{ color: theme.text }}
            className="font-semibold text-sm"
            numberOfLines={1}
          >
            {title || "Property Location"}
          </Text>
          <Text style={{ color: theme.textMuted }} className="text-xs" numberOfLines={1}>
            {address || "Location Map"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`)
          }
          style={{ backgroundColor: theme.accentLight }}
          className="flex-row items-center gap-1 px-3 py-2 rounded-full"
        >
          <Ionicons name="navigate-outline" size={14} color={theme.accent} />
          <Text style={{ color: theme.accent }} className="text-xs font-semibold">
            Google Maps
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full Screen Map */}
      <WebView source={{ uri: mapUrl }} style={{ flex: 1 }} />
    </SafeAreaView>
  );
}
