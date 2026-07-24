import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomSpinner from "../../../components/CustomSpinner";
import FilterModal from "../../../components/FilterModal";
import PropertyCard from "../../../components/PropertyCard";
import { useSupabase } from "../../../hooks/useSupabase";
import { useFilterStore } from "../../../store/filterStore";
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

const filterSeedProperties = (
  properties: Property[],
  searchStr: string,
  typeVal: string | null,
  bedsVal: number | null,
  minP: number | null,
  maxP: number | null
) => {
  return properties.filter((p) => {
    if (searchStr && searchStr.trim()) {
      const q = searchStr.toLowerCase().trim();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      const matchAddress = p.address.toLowerCase().includes(q);
      if (!matchTitle && !matchCity && !matchAddress) return false;
    }
    if (typeVal && p.type !== typeVal) return false;
    if (bedsVal !== null && p.bedrooms < bedsVal) return false;
    if (minP !== null && p.price < minP) return false;
    if (maxP !== null && p.price > maxP) return false;
    return true;
  });
};

import { useTheme } from "../../../context/ThemeContext";

export default function SearchScreen() {
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const supabase = useSupabase();
  const { theme } = useTheme();
  const { openFilters } = useLocalSearchParams<{ openFilters?: string }>();

  useEffect(() => {
    if (openFilters === "true") {
      setShowFilters(true);
    }
  }, [openFilters]);

  const {
    search,
    type,
    bedrooms,
    minPrice,
    maxPrice,
    setSearch,
    setType,
    setBedrooms,
    setMinPrice,
    setMaxPrice,
  } = useFilterStore();

  const activeFilterCount = [
    type !== null,
    bedrooms !== null,
    minPrice !== null,
    maxPrice !== null,
  ].filter(Boolean).length;

  useEffect(() => {
    fetchResults();
  }, [search, type, bedrooms, minPrice, maxPrice]);

  const fetchResults = async () => {
    setLoading(true);

    try {
      let query = supabase.from("properties").select("*");

      if (search && search.trim()) {
        query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%`);
      }
      if (type) query = query.eq("type", type);
      if (bedrooms) query = query.eq("bedrooms", bedrooms);
      if (minPrice) query = query.gte("price", minPrice);
      if (maxPrice) query = query.lte("price", maxPrice);

      const res = await query.order("created_at", { ascending: false });

      if (res && res.data && res.data.length > 0) {
        setResults(res.data);
      } else {
        const filtered = filterSeedProperties(
          SEED_PROPERTIES,
          search,
          type,
          bedrooms,
          minPrice,
          maxPrice
        );
        setResults(filtered);
      }
    } catch (err) {
      console.error("Fetch search results error:", err);
      const filtered = filterSeedProperties(
        SEED_PROPERTIES,
        search,
        type,
        bedrooms,
        minPrice,
        maxPrice
      );
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  };

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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text style={{ fontSize: 24, fontWeight: "600", color: theme.text, marginBottom: 16 }}>
          Find Property
        </Text>

        {/* Search Bar + Filter Button */}
        <View className="flex-row items-center gap-3">
          <View
            className="flex-1 flex-row items-center rounded-2xl px-4 gap-3 border"
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
            <TextInput
              className="flex-1 py-3 focus:outline-none text-sm"
              style={{ color: theme.text }}
              placeholder="Search by title or city..."
              placeholderTextColor={theme.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            className="w-12 h-12 rounded-2xl items-center justify-center border"
            style={{
              backgroundColor: activeFilterCount > 0 ? theme.accent : theme.inputBg,
              borderColor: activeFilterCount > 0 ? theme.accent : theme.inputBorder,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: theme.mode === 'dark' ? 0.2 : 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={activeFilterCount > 0 ? "#fff" : theme.text}
            />
            {activeFilterCount > 0 && (
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-[9px] font-bold">
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {type && (
              <View style={{ backgroundColor: theme.accentLight, borderColor: theme.accent, borderWidth: 1 }} className="flex-row items-center rounded-full px-3 py-1 gap-1">
                <Text style={{ color: theme.accent }} className="text-xs font-semibold capitalize">
                  {type}
                </Text>
                <TouchableOpacity onPress={() => setType(null)}>
                  <Ionicons name="close" size={12} color={theme.accent} />
                </TouchableOpacity>
              </View>
            )}
            {bedrooms !== null && (
              <View style={{ backgroundColor: theme.accentLight, borderColor: theme.accent, borderWidth: 1 }} className="flex-row items-center rounded-full px-3 py-1 gap-1">
                <Ionicons name="bed-outline" size={11} color={theme.accent} />
                <Text style={{ color: theme.accent }} className="text-xs font-semibold">
                  {bedrooms === 4
                    ? "4+ beds"
                    : `${bedrooms} bed${bedrooms > 1 ? "s" : ""}`}
                </Text>
                <TouchableOpacity onPress={() => setBedrooms(null)}>
                  <Ionicons name="close" size={12} color={theme.accent} />
                </TouchableOpacity>
              </View>
            )}
            {(minPrice !== null || maxPrice !== null) && (
              <View style={{ backgroundColor: theme.accentLight, borderColor: theme.accent, borderWidth: 1 }} className="flex-row items-center rounded-full px-3 py-1 gap-1">
                <Text style={{ color: theme.accent }} className="text-xs font-semibold">
                  {minPrice && maxPrice
                    ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`
                    : minPrice
                    ? `From ${formatPrice(minPrice)}`
                    : `Up to ${formatPrice(maxPrice!)}`}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setMinPrice(null);
                    setMaxPrice(null);
                  }}
                >
                  <Ionicons name="close" size={12} color={theme.accent} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Results / Spinner */}
      {loading ? (
        <View className="flex-1 items-center justify-center py-24">
          <CustomSpinner size={44} color={theme.textMuted} />
          <Text style={{ color: theme.textMuted }} className="text-sm mt-3 font-semibold">
            Searching properties...
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <PropertyCard property={item} />}
          ListHeaderComponent={
            <Text style={{ color: theme.textMuted }} className="text-sm mb-4">
              {`${results.length} properties found`}
            </Text>
          }
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="search-outline" size={48} color={theme.textMuted} />
              <Text style={{ color: theme.textMuted }} className="mt-4 text-base font-semibold">
                No properties found
              </Text>
              <Text style={{ color: theme.textMuted }} className="text-sm mt-1">
                Try a different search or adjust filters
              </Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
}
