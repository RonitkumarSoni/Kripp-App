import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomSpinner from "../../../components/CustomSpinner";
import PropertyCard from "../../../components/PropertyCard";
import { useSupabase } from "../../../hooks/useSupabase";
import { Property, SavedProperty } from "../../../types";

const SEED_SAVED_PROPERTIES: Property[] = [
  {
    id: "prop_1",
    title: "Modern Luxury Villa with Pool",
    type: "villa",
    price: 25000000,
    bedrooms: 4,
    bathrooms: 4,
    area_sqft: 3200,
    address: "Banjara Hills",
    city: "Hyderabad",
    is_featured: true,
    is_sold: false,
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    ],
  },
  {
    id: "prop_2",
    title: "Sea Facing Luxury Apartment",
    type: "apartment",
    price: 18500000,
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 2100,
    address: "Bandra West",
    city: "Mumbai",
    is_featured: true,
    is_sold: false,
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    ],
  },
];

export default function SavedScreen() {
  const { user } = useUser();
  const supabase = useSupabase();
  const router = useRouter();

  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    try {
      if (!user) {
        const fallback = SEED_SAVED_PROPERTIES.map((p) => ({
          id: `saved_${p.id}`,
          property_id: p.id,
          properties: p,
        }));
        setSaved(fallback);
        setLoading(false);
        return;
      }

      const res = await supabase
        .from("saved_properties")
        .select("id, property_id, properties(*)")
        .eq("user_clerk_id", user.id)
        .order("id", { ascending: false });

      if (res && res.data) {
        const validSaved = res.data.filter((item: any) => item.properties !== null);
        setSaved(validSaved as unknown as SavedProperty[]);
      } else {
        setSaved([]);
      }
    } catch (err) {
      console.error("Fetch saved error:", err);
      setSaved([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchSaved();
    }, [fetchSaved])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-semibold text-gray-900">Saved</Text>
        {!loading && (
          <Text className="text-sm text-gray-400 mt-1">
            {saved.length} {saved.length === 1 ? "property" : "properties"} saved
          </Text>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-24">
          <CustomSpinner size={44} color="#64748b" />
          <Text className="text-gray-400 text-sm mt-3 font-semibold">
            Loading saved properties...
          </Text>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item.properties}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24">
              <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="heart-outline" size={36} color="#EF4444" />
              </View>
              <Text className="text-gray-900 text-lg font-semibold mb-1">
                No saved properties
              </Text>
              <Text className="text-gray-400 text-sm text-center px-8">
                Tap the heart icon on any property to save it here
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(root)/(tabs)/search")}
                className="mt-6 bg-blue-600 px-6 py-3 rounded-2xl"
              >
                <Text className="text-white font-semibold">
                  Browse Properties
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
