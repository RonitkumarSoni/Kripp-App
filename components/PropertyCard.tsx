import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSavedProperty } from "../hooks/useSavedProperty";

export default function PropertyCard({ property }: { property: any }) {
  const router = useRouter();

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
      className="flex-row bg-white rounded-2xl p-3 mb-3 border border-gray-100 shadow-sm relative overflow-hidden"
    >
      <Image
        source={{ uri: property.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800" }}
        style={{ width: 96, height: 96, borderRadius: 12 }}
        resizeMode="cover"
      />
      <View className="flex-1 ml-4 justify-between pr-4">
        <View>
          <Text className="text-gray-900 font-semibold text-base leading-tight mb-1" numberOfLines={1}>
            {property.title}
          </Text>
          <View className="flex-row items-center mb-1">
            <Ionicons name="location-outline" size={12} color="#6b7280" />
            <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>
              {property.city || property.address}
            </Text>
          </View>
        </View>

        <View className="flex-row items-end justify-between">
          <Text className="text-blue-600 font-bold text-base">
            {formatPrice(property.price)}
          </Text>
          <View className="flex-row items-center space-x-3">
            <View className="flex-row items-center">
              <Ionicons name="bed-outline" size={12} color="#6b7280" />
              <Text className="text-gray-600 text-xs ml-1">{property.bedrooms || 1} bd</Text>
            </View>
            {property.area_sqft && (
              <View className="flex-row items-center ml-2">
                <Ionicons name="expand-outline" size={12} color="#6b7280" />
                <Text className="text-gray-600 text-xs ml-1">{property.area_sqft} ft²</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
