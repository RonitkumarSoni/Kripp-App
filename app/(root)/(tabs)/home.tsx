import { useUser } from "../../../context/AuthContext";
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
import FeaturedCard, { FEATURED_CARD_WIDTH, FEATURED_CARD_GAP } from "../../../components/FeaturedCard";
import PropertyCard from "../../../components/PropertyCard";
import * as database from "../../../lib/database";
import { Property } from "../../../types";

import { SEED_PROPERTIES } from "../../../constants/data";

import { useTheme } from "../../../context/ThemeContext";

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const { theme } = useTheme();

  const [featured, setFeatured] = useState<Property[]>(SEED_PROPERTIES.filter(p => p.is_featured));
  const [recommended, setRecommended] = useState<Property[]>(SEED_PROPERTIES.filter(p => !p.is_featured));
  const [loading, setLoading] = useState(false);
  const featuredRef = useRef<FlatList>(null);
  const featuredIndex = useRef(0);
  const CARD_WIDTH = FEATURED_CARD_WIDTH + FEATURED_CARD_GAP; // card width + margin

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
      // Keep existing cards visible while the database refreshes.

      const res = await database.listProperties();

      if (res.error) throw res.error;
      const dbProperties = res && res.data ? res.data : [];
      
      // Combine DB properties with SEED_PROPERTIES, ensuring no duplicates if IDs match
      const combined = [...dbProperties];
      SEED_PROPERTIES.forEach(seed => {
        if (!combined.find(p => p.id === seed.id)) {
          combined.push(seed);
        }
      });

      setFeatured(combined.filter((p: Property) => p.is_featured));
      setRecommended(combined.filter((p: Property) => !p.is_featured));
    } catch (err) {
      console.error("Error fetching properties:", err);
      setFeatured(SEED_PROPERTIES.filter((p) => p.is_featured));
      setRecommended(SEED_PROPERTIES.filter((p) => !p.is_featured));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <FlatList
        data={recommended}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
              <Image
                source={require("../../../assets/images/kribb.png")}
                style={{ width: 100, height: 40, tintColor: theme.mode === 'dark' ? '#FFF' : undefined }}
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
                  backgroundColor: theme.card,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="notifications-outline" size={20} color={theme.text} />
                <View
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: theme.accent,
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
              onPress={() => router.push("/(root)/(tabs)/search")}
              className="mx-5 mb-6 flex-row items-center rounded-2xl px-4 py-3 gap-3 border"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name="search-outline" size={18} color={theme.textMuted} />
              <Text style={{ color: theme.textMuted, fontSize: 14, flex: 1 }}>
                Search properties, cities...
              </Text>
              <View style={{ width: 32, height: 32, backgroundColor: theme.accent, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="options-outline" size={15} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Content Area */}
            {loading ? null : (
              <>
                {/* Featured Section */}
                {featured.length > 0 && (
                  <View className="mb-6">
                    <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600', paddingHorizontal: 20, marginBottom: 16 }}>
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
                      onMomentumScrollEnd={event => { featuredIndex.current = Math.max(0, Math.min(featured.length - 1, Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH))); }}
                    />
                  </View>
                )}

                {/* Recommended Header */}
                <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600', paddingHorizontal: 20, marginBottom: 16 }}>
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
              <CustomSpinner size={44} color={theme.textMuted} />
            </View>
          ) : (
            <View className="items-center py-10">
              <Text style={{ color: theme.textMuted, fontWeight: '600' }}>No properties found</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
