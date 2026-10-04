import { useUser } from "../../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomSpinner from "../../../components/CustomSpinner";
import PropertyCard from "../../../components/PropertyCard";
import * as database from "../../../lib/database";
import { Property, SavedProperty } from "../../../types";

import { SEED_PROPERTIES } from "../../../constants/data";
import { useTheme } from "../../../context/ThemeContext";

const LOCAL_SAVED_KEY = "kribb_local_saved_properties";

export default function SavedScreen() {
  const { user } = useUser();
  const router = useRouter();
  const { theme } = useTheme();

  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    try {
      const allSaved: SavedProperty[] = [];

      // 1. Fetch locally saved seeded properties from AsyncStorage
      try {
        const raw = await AsyncStorage.getItem(LOCAL_SAVED_KEY);
        const localIds: string[] = raw ? JSON.parse(raw) : [];
        localIds.forEach((id) => {
          const seeded = SEED_PROPERTIES.find((p) => p.id === id);
          if (seeded) {
            allSaved.push({
              id: `local_${id}`,
              property_id: id,
              properties: seeded,
            });
          }
        });
      } catch (e) {
        console.error("Error reading local saved:", e);
      }

      // 2. Fetch DB-saved properties from Firestore (only if user is logged in)
      if (user) {
        try {
          const res = await database.listSavedProperties();
          if (res.error) throw res.error;

          if (res && res.data) {
            res.data.forEach((item: any) => {
              if (item.properties !== null) {
                allSaved.push(item as unknown as SavedProperty);
              }
            });
          }
        } catch (e) {
          console.error("Error fetching DB saved:", e);
        }
      }

      setSaved(allSaved);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text style={{ fontSize: 24, fontWeight: "600", color: theme.text }}>Saved</Text>
        {!loading && (
          <Text style={{ color: theme.textMuted }} className="text-sm mt-1">
            {saved.length} {saved.length === 1 ? "property" : "properties"} saved
          </Text>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-24">
          <CustomSpinner size={44} color={theme.textMuted} />
          <Text style={{ color: theme.textMuted }} className="text-sm mt-3 font-semibold">
            Loading saved properties...
          </Text>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item.properties}
              onUnsave={fetchSaved}
            />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24">
              <View style={{ backgroundColor: theme.accentLight }} className="w-20 h-20 rounded-full items-center justify-center mb-4">
                <Ionicons name="heart-outline" size={36} color={theme.accent} />
              </View>
              <Text style={{ color: theme.text }} className="text-lg font-semibold mb-1">
                No saved properties
              </Text>
              <Text style={{ color: theme.textMuted }} className="text-sm text-center px-8">
                Tap the heart icon on any property to save it here
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(root)/(tabs)/search")}
                style={{ backgroundColor: theme.accent }}
                className="mt-6 px-6 py-3 rounded-2xl"
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
