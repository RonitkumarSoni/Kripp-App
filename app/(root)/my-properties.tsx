import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

import { useSupabase } from "../../hooks/useSupabase";
import { Property } from "../../types";
import { useTheme } from "../../context/ThemeContext";
import CustomSpinner from "../../components/CustomSpinner";
import PropertyCard from "../../components/PropertyCard";
import { useInAppNotification } from "../../context/NotificationContext";
import { MESSAGES } from "../../constants/messages";

export default function MyPropertiesScreen() {
  const router = useRouter();
  const { user } = useUser();
  const supabase = useSupabase();
  const { theme } = useTheme();
  const { showNotification } = useInAppNotification();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchMyProperties();
    }, [user?.id])
  );

  const fetchMyProperties = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_clerk_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      console.error("Error fetching my properties:", err);
      showNotification({
        title: "Error",
        body: MESSAGES.PROPERTY.FETCH_ERROR,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      MESSAGES.PROPERTY.DELETE_CONFIRM_TITLE,
      MESSAGES.PROPERTY.DELETE_CONFIRM_BODY,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("properties")
                .delete()
                .eq("id", id)
                .eq("owner_clerk_id", user?.id); // extra safety

              if (error) throw error;

              showNotification({
                title: "Deleted",
                body: MESSAGES.PROPERTY.DELETE_SUCCESS,
                type: "success",
              });
              
              fetchMyProperties();
            } catch (error) {
              console.error("Error deleting property:", error);
              showNotification({
                title: "Error",
                body: MESSAGES.PROPERTY.DELETE_ERROR,
                type: "error",
              });
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Property }) => (
    <View className="mb-4">
      <PropertyCard property={item} />
      <View className="flex-row items-center gap-3 mt-1">
        <TouchableOpacity
          onPress={() => router.push(`/(root)/edit-property/${item.id}`)}
          style={{ backgroundColor: theme.accent, borderColor: theme.accent }}
          className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl border"
        >
          <Ionicons name="pencil" size={16} color="white" />
          <Text className="text-white font-medium">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={{ backgroundColor: theme.mode === 'dark' ? 'rgba(239,68,68,0.1)' : '#FEF2F2', borderColor: 'rgba(239,68,68,0.3)' }}
          className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl border"
        >
          <Ionicons name="trash" size={16} color="#EF4444" />
          <Text className="text-red-500 font-medium">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View style={{ borderBottomColor: theme.cardBorder }} className="flex-row items-center px-4 py-3 border-b mb-2">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={{ color: theme.text }} className="text-lg font-bold ml-2">
          My Properties
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <CustomSpinner size={40} color={theme.textMuted} />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 mt-10">
              <View style={{ backgroundColor: theme.card }} className="w-24 h-24 rounded-full items-center justify-center mb-4">
                <Ionicons name="home-outline" size={40} color={theme.textMuted} />
              </View>
              <Text style={{ color: theme.text }} className="text-lg font-bold mb-2">
                No Properties Listed
              </Text>
              <Text style={{ color: theme.textMuted }} className="text-center px-6 leading-5 mb-6">
                You haven't listed any properties yet. List your property to get started.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(root)/(tabs)/create")}
                style={{ backgroundColor: theme.accent }}
                className="px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold">List a Property</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
