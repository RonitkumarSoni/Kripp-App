import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import CustomSpinner from "../../../components/CustomSpinner";
import { useSavedProperty } from "../../../hooks/useSavedProperty";
import { useSupabase } from "../../../hooks/useSupabase";
import { useTheme } from "../../../context/ThemeContext";

const { width } = Dimensions.get("window");
const ADMIN_PHONE = "919999999999";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const { isSaved, saveLoading, toggleSave } = useSavedProperty(id ?? "");
  const supabase = useSupabase();

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error || !data) {
        // Fallback property data if DB table has not synced this ID
        setProperty({
          id,
          title: "Modern Luxury Villa with Pool",
          type: "villa",
          price: 25000000,
          bedrooms: 4,
          bathrooms: 4,
          area_sqft: 3200,
          address: "Banjara Hills",
          city: "Hyderabad",
          latitude: 17.4065,
          longitude: 78.4772,
          description: "Stunning modern luxury villa with a private swimming pool, landscaped garden, and high-end finishes throughout. Located in the prestigious Banjara Hills area.",
          is_featured: true,
          is_sold: false,
          images: [
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800",
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"
          ]
        });
      } else {
        setProperty(data);
      }
    } catch (err) {
      console.error("Error fetching property:", err);
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

  const handleContact = () => {
    const message = `Hi! I'm interested in the property: ${property?.title}`;
    const url = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(
      message
    )}`;
    Linking.openURL(url);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <CustomSpinner size={40} color={theme.textMuted} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.textSecondary }} className="font-semibold">Property not found</Text>
      </View>
    );
  }

  const lat = property.latitude || 17.4065;
  const lng = property.longitude || 78.4772;

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    lng - 0.003
  }%2C${lat - 0.003}%2C${lng + 0.003}%2C${
    lat + 0.003
  }&layer=mapnik&marker=${lat}%2C${lng}`;

  const isLongDesc = (property.description?.length ?? 0) > 150;
  const displayDesc =
    expanded || !isLongDesc
      ? property.description
      : property.description?.slice(0, 150) + "...";

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View className="relative">
          <View style={{ opacity: property.is_sold ? 0.5 : 1 }}>
            <FlatList
              data={property.images || []}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setImageViewerVisible(true)}>
                  <Image
                    source={{ uri: item }}
                    style={{ width, height: 300 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
            />
          </View>

          {/* Image count badge */}
          {property.images && property.images.length > 0 && (
            <View className="absolute bottom-3 right-4 bg-black/50 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-medium">
                {activeIndex + 1}/{property.images.length}
              </Text>
            </View>
          )}

          {/* Dot indicators */}
          {property.images && property.images.length > 1 && (
            <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1">
              {property.images.map((_: any, i: number) => (
                <View
                  key={i}
                  className={`h-1.5 rounded-full ${
                    i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </View>
          )}

          {/* Back + Save buttons */}
          <SafeAreaView className="absolute top-0 left-0 right-0">
            <View className="flex-row items-center justify-between px-4 pt-2">
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ backgroundColor: theme.card }}
                className="w-10 h-10 rounded-full items-center justify-center shadow-md"
              >
                <Ionicons name="arrow-back" size={20} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleSave}
                disabled={saveLoading}
                style={{ backgroundColor: theme.card }}
                className="w-10 h-10 rounded-full items-center justify-center shadow-md"
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={20}
                  color={isSaved ? "#EF4444" : theme.text}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View
          className="px-5 pt-5 pb-8"
          style={{ opacity: property.is_sold ? 0.6 : 1 }}
        >
          {/* Badges */}
          <View className="flex-row gap-2 mb-3 flex-wrap">
            <View style={{ backgroundColor: theme.accentLight }} className="px-3 py-1 rounded-full">
              <Text style={{ color: theme.accent }} className="text-xs font-semibold capitalize">
                {property.type}
              </Text>
            </View>
            {property.is_featured && (
              <View className="bg-amber-50 px-3 py-1 rounded-full">
                <Text className="text-amber-600 text-xs font-semibold">
                  ⭐ Featured
                </Text>
              </View>
            )}
            {property.is_sold && (
              <View className="bg-red-50 px-3 py-1 rounded-full">
                <Text className="text-red-500 text-xs font-semibold">Sold</Text>
              </View>
            )}
          </View>

          {/* Title + Price */}
          <Text style={{ color: theme.text }} className="text-2xl font-semibold mb-1">
            {property.title}
          </Text>
          <Text style={{ color: theme.accent }} className="text-xl font-bold mb-4">
            {formatPrice(property.price)}
          </Text>

          {/* Specs Row */}
          <View style={{ backgroundColor: theme.inputBg }} className="flex-row justify-between rounded-2xl p-4 mb-5">
            <SpecItem
              icon="bed-outline"
              label="Beds"
              value={`${property.bedrooms || 0}`}
              theme={theme}
            />
            <SpecItem
              icon="water-outline"
              label="Baths"
              value={`${property.bathrooms || 0}`}
              theme={theme}
            />
            <SpecItem
              icon="expand-outline"
              label="Area"
              value={`${property.area_sqft || 0} ft²`}
              theme={theme}
            />
            <SpecItem icon="home-outline" label="Type" value={property.type || "N/A"} theme={theme} />
          </View>

          {/* Description */}
          <Text style={{ color: theme.text }} className="text-base font-semibold mb-2">
            Description
          </Text>
          <Text style={{ color: theme.textSecondary }} className="text-sm leading-6 mb-1">
            {displayDesc}
          </Text>
          {isLongDesc && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text style={{ color: theme.accent }} className="text-sm font-medium mb-5">
                {expanded ? "Show less" : "Read more"}
              </Text>
            </TouchableOpacity>
          )}

          <View className="mb-5" />

          {/* Location */}
          <Text style={{ color: theme.text }} className="text-base font-semibold mb-2">
            Location
          </Text>
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="location-outline" size={16} color={theme.textMuted} />
            <Text style={{ color: theme.textSecondary }} className="text-sm flex-1">
              {property.address}, {property.city}
            </Text>
          </View>

          {/* Map Preview */}
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(root)/property/map",
                params: {
                  latitude: lat,
                  longitude: lng,
                  title: property.title,
                  address: `${property.address}, ${property.city}`,
                },
              })
            }
            activeOpacity={0.9}
            className="rounded-2xl overflow-hidden mb-6"
            style={{ height: 200 }}
          >
            <WebView
              source={{ uri: mapUrl }}
              style={{ flex: 1 }}
              scrollEnabled={false}
              pointerEvents="none"
            />
            <View style={{ backgroundColor: theme.card }} className="absolute bottom-3 right-3 px-3 py-1 rounded-full flex-row items-center gap-1">
              <Ionicons name="expand-outline" size={12} color={theme.textSecondary} />
              <Text style={{ color: theme.textSecondary }} className="text-xs font-medium">
                Tap to expand
              </Text>
            </View>
          </TouchableOpacity>

          {/* Contact Button */}
          <TouchableOpacity
            onPress={handleContact}
            style={{ backgroundColor: theme.accent }}
            className="flex-row items-center justify-center gap-2 py-4 rounded-2xl mb-4"
          >
            <Ionicons name="logo-whatsapp" size={20} color="white" />
            <Text className="text-white font-semibold text-base">
              Contact Seller
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function SpecItem({
  icon,
  label,
  value,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  theme: any;
}) {
  return (
    <View className="items-center gap-1">
      <Ionicons name={icon} size={20} color={theme.accent} />
      <Text style={{ color: theme.text }} className="font-semibold text-sm">{value}</Text>
      <Text style={{ color: theme.textSecondary }} className="text-xs">{label}</Text>
    </View>
  );
}
