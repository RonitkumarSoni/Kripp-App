import React from "react";
import { Image, Text, TouchableOpacity, View, FlatList, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSavedProperty } from "../hooks/useSavedProperty";
import { useTheme } from "../context/ThemeContext";

export default function FeaturedCard({ property }: { property: any }) {
  const router = useRouter();
  const { theme } = useTheme();
  const { isSaved, saveLoading, toggleSave } = useSavedProperty(property.id);

  const formatPrice = (price: number) => {
    if (!price) return "₹0";
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(0)}L`;
    }
    return `₹${price}`;
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(root)/property/${property.id}`)}
      className="w-72 mr-4 rounded-3xl overflow-hidden border shadow-sm relative"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.cardBorder,
        opacity: property.is_sold ? 0.5 : 1,
      }}
    >
      {property.images && property.images.length > 1 ? (
        <View style={{ width: 288, height: 176, overflow: "hidden" }}>
          <FlatList
            data={property.images}
            keyExtractor={(_, idx) => idx.toString()}
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            style={{ width: 288, height: 176 }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width: 288, height: 176 }}
                resizeMode="cover"
              />
            )}
          />
        </View>
      ) : (
        <Image
          source={{ uri: property.images?.[0] || "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800" }}
          style={{ width: "100%", height: 176 }}
          resizeMode="cover"
        />
      )}

      <View className="absolute top-3 left-3 px-3 py-1 rounded-full z-10" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
        <Text className="text-xs font-semibold text-gray-800 capitalize">
          {property.type || "Villa"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={toggleSave}
        disabled={saveLoading}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          backgroundColor: theme.card,
          borderRadius: 20,
          width: 32,
          height: 32,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.1,
          shadowRadius: 4,
        }}
      >
        <Ionicons
          name={isSaved ? "heart" : "heart-outline"}
          size={18}
          color={isSaved ? "#EF4444" : theme.textSecondary}
        />
      </TouchableOpacity>

      <View className="p-4">
        <Text style={{ color: theme.text }} className="font-semibold text-base mb-1" numberOfLines={1}>
          {property.title}
        </Text>
        
        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
          <Text style={{ color: theme.textSecondary }} className="text-xs ml-1" numberOfLines={1}>
            {property.city || property.address}
          </Text>
        </View>

        <View className="flex-row items-center justify-between pt-2 border-t" style={{ borderColor: theme.cardBorder }}>
          <Text style={{ color: theme.accent }} className="font-bold text-base">
            {formatPrice(property.price)}
          </Text>
          <View className="flex-row items-center space-x-3">
            <View className="flex-row items-center">
              <Ionicons name="bed-outline" size={12} color={theme.textSecondary} />
              <Text style={{ color: theme.textSecondary }} className="text-xs ml-1">{property.bedrooms || 1} bd</Text>
            </View>
            {property.area_sqft && (
              <View className="flex-row items-center ml-2">
                <Ionicons name="expand-outline" size={12} color={theme.textSecondary} />
                <Text style={{ color: theme.textSecondary }} className="text-xs ml-1">{property.area_sqft} ft²</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
