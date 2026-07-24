import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomSpinner from "../../../components/CustomSpinner";
import FeaturedCard from "../../../components/FeaturedCard";
import PropertyCard from "../../../components/PropertyCard";
import { useSupabase } from "../../../hooks/useSupabase";
import { Property } from "../../../types";

const SEED_PROPERTIES: Property[] = [
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
  {
    id: "prop_3",
    title: "Penthouse with City Skyline View",
    type: "apartment",
    price: 32000000,
    bedrooms: 4,
    bathrooms: 5,
    area_sqft: 4500,
    address: "Indiranagar",
    city: "Bengaluru",
    is_featured: true,
    is_sold: false,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    ],
  },
  {
    id: "prop_4",
    title: "Cozy Studio Apartment",
    type: "studio",
    price: 4500000,
    bedrooms: 1,
    bathrooms: 1,
    area_sqft: 650,
    address: "Koregaon Park",
    city: "Pune",
    is_featured: false,
    is_sold: false,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    ],
  },
  {
    id: "prop_5",
    title: "Elegant Duplex House",
    type: "house",
    price: 14000000,
    bedrooms: 3,
    bathrooms: 3,
    area_sqft: 2400,
    address: "Jubilee Hills",
    city: "Hyderabad",
    is_featured: false,
    is_sold: false,
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
    ],
  },
  {
    id: "prop_6",
    title: "Greenery Surrounded Villa",
    type: "villa",
    price: 21000000,
    bedrooms: 4,
    bathrooms: 4,
    area_sqft: 3800,
    address: "ECR Road",
    city: "Chennai",
    is_featured: false,
    is_sold: true,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    ],
  },
];

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = useSupabase();

  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const featuredRef = useRef<FlatList>(null);
  const featuredIndex = useRef(0);
  const CARD_WIDTH = 288 + 16; // card width + margin

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      featuredIndex.current = (featuredIndex.current + 1) % featured.length;
      featuredRef.current?.scrollToOffset({
        offset: featuredIndex.current * CARD_WIDTH,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [featured]);

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [])
  );

  const fetchProperties = async () => {
    try {
      setLoading(true);

      const res = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      let list =
        res && res.data && res.data.length > 0 ? res.data : SEED_PROPERTIES;

      setFeatured(list.filter((p: Property) => p.is_featured));
      setRecommended(list.filter((p: Property) => !p.is_featured));
    } catch (err) {
      console.error("Error fetching properties:", err);
      setFeatured(SEED_PROPERTIES.filter((p) => p.is_featured));
      setRecommended(SEED_PROPERTIES.filter((p) => !p.is_featured));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
              <Image
                source={require("../../../assets/images/kribb.png")}
                style={{ width: 100, height: 40 }}
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const Haptics = require("expo-haptics");
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch (e) {}
                  router.push("/(root)/notification");
                }}
                style={{
                  position: "relative",
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: "#F3F4F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="notifications-outline" size={20} color="#374151" />
                <View
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: "#2563EB",
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
              onPress={() => router.push("/(root)/(tabs)/search")}
              className="mx-5 mb-6 flex-row items-center bg-white rounded-2xl px-4 py-3 gap-3 border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <Text className="text-gray-400 text-sm flex-1">
                Search properties, cities...
              </Text>
              <View className="w-8 h-8 bg-blue-600 rounded-xl items-center justify-center">
                <Ionicons name="options-outline" size={15} color="white" />
              </View>
            </TouchableOpacity>

            {/* Content Area */}
            {loading ? null : (
              <>
                {/* Featured Section */}
                {featured.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-gray-900 text-lg font-semibold px-5 mb-4">
                      Featured
                    </Text>
                    <FlatList
                      ref={featuredRef}
                      data={featured}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => <FeaturedCard property={item} />}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: 20 }}
                      snapToInterval={CARD_WIDTH}
                      decelerationRate="fast"
                    />
                  </View>
                )}

                {/* Recommended Header */}
                <Text className="text-gray-900 text-lg font-semibold px-5 mb-4">
                  Recommended
                </Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View className="px-5">
            <PropertyCard property={item} />
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View className="flex-1 items-center justify-center py-24">
              <CustomSpinner size={44} color="#64748b" />
            </View>
          ) : (
            <View className="items-center py-10">
              <Text className="text-gray-400 font-semibold">No properties found</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
