import { useUser } from "../../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import CustomSpinner from "../../../components/CustomSpinner";
import * as database from "../../../lib/database";
import { useTheme } from "../../../context/ThemeContext";

export default function AddProperty() {
  const { user } = useUser();
  const { theme, isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("apartment");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const propertyTypes = [
    { label: "Apartment", value: "apartment" },
    { label: "House", value: "house" },
    { label: "Villa", value: "villa" },
    { label: "Studio", value: "studio" },
  ];

  const handleAddProperty = async () => {
    if (!user) {
      Alert.alert("Error", "You must be signed in to add properties.");
      return;
    }

    if (!title || !price || !address || !city) {
      Alert.alert("Missing Fields", "Please fill in all required fields (Title, Price, Address, City).");
      return;
    }

    try {
      setLoading(true);

      const { data: userData, error: userError } = await database.getUserProfile(user.id);

      if (userError || !userData?.is_admin) {
        Alert.alert("Permission Denied", "Only administrators are authorized to add new properties.");
        setLoading(false);
        return;
      }

      const { error } = await database.createProperty(
        {
          title,
          description,
          price: parseFloat(price),
          type,
          bedrooms: parseInt(bedrooms.toString()),
          bathrooms: parseInt(bathrooms.toString()),
          area_sqft: area ? parseInt(area) : null,
          address,
          city,
          images: [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
          ],
          is_featured: false,
          is_sold: false,
        },
      );

      if (error) throw error;

      Alert.alert("Success 🎉", "Property added successfully!", [
        {
          text: "OK",
          onPress: () => {
            setTitle("");
            setDescription("");
            setPrice("");
            setArea("");
            setAddress("");
            setCity("");
            router.push("/(root)/(tabs)/home");
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong while adding the property.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={theme.statusBarStyle} />
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text style={{ color: theme.text }} className="font-semibold text-3xl">Add Property</Text>
          <Text style={{ color: theme.textSecondary }} className="text-sm mt-1">Admin Panel — Create a new listing</Text>
        </View>

        {/* Form Fields */}
        <View className="space-y-4 mb-8">
          <View>
            <Text style={{ color: theme.textSecondary }} className="font-semibold text-sm mb-2">Property Title *</Text>
            <TextInput
              placeholder="e.g. Modern Luxury Villa"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={setTitle}
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              className="border rounded-2xl px-4 py-3.5 text-base"
            />
          </View>

          <View className="mt-4">
            <Text style={{ color: theme.textSecondary }} className="font-semibold text-sm mb-2">Property Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {propertyTypes.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setType(item.value)}
                  style={{ 
                    backgroundColor: type === item.value ? theme.accent : theme.inputBg,
                    borderColor: type === item.value ? theme.accent : theme.inputBorder
                  }}
                  className="px-4 py-2.5 rounded-full border"
                >
                  <Text
                    style={{ color: type === item.value ? "#fff" : theme.textSecondary }}
                    className="text-sm font-semibold"
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mt-4">
            <Text style={{ color: theme.textSecondary }} className="font-semibold text-sm mb-2">Price (₹) *</Text>
            <TextInput
              placeholder="e.g. 15000000"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              className="border rounded-2xl px-4 py-3.5 text-base"
            />
          </View>

          <View className="flex-row space-x-4 mt-4">
            <View className="flex-1">
              <Text style={{ color: theme.textSecondary }} className="font-semibold text-sm mb-2">Bedrooms</Text>
              <View style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }} className="flex-row items-center justify-between border rounded-2xl px-3 py-2">
                <TouchableOpacity
                  onPress={() => setBedrooms(Math.max(1, bedrooms - 1))}
                  style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
                  className="p-1.5 rounded-xl border shadow-sm"
                >
                  <Ionicons name="remove" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
                <Text style={{ color: theme.text }} className="font-semibold text-base">{bedrooms}</Text>
                <TouchableOpacity
                  onPress={() => setBedrooms(bedrooms + 1)}
                  style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
                  className="p-1.5 rounded-xl border shadow-sm"
                >
                  <Ionicons name="add" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-1 ml-3">
              <Text style={{ color: theme.textSecondary }} className="font-semibold text-sm mb-2">Bathrooms</Text>
              <View style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }} className="flex-row items-center justify-between border rounded-2xl px-3 py-2">
                <TouchableOpacity
                  onPress={() => setBathrooms(Math.max(1, bathrooms - 1))}
                  style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
                  className="p-1.5 rounded-xl border shadow-sm"
                >
                  <Ionicons name="remove" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
                <Text style={{ color: theme.text }} className="font-semibold text-base">{bathrooms}</Text>
                <TouchableOpacity
                  onPress={() => setBathrooms(bathrooms + 1)}
                  style={{ backgroundColor: theme.card, borderColor: theme.cardBorder }}
                  className="p-1.5 rounded-xl border shadow-sm"
                >
                  <Ionicons name="add" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="mt-4">
            <Text style={{ color: theme.textSecondary }} className="font-semibold text-sm mb-2">Area (sq ft)</Text>
            <TextInput
              placeholder="e.g. 1800"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={area}
              onChangeText={setArea}
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              className="border rounded-2xl px-4 py-3.5 text-base"
            />
          </View>

          <View className="mt-4">
            <Text style={{ color: theme.textSecondary }} className="font-semibold text-sm mb-2">Address *</Text>
            <TextInput
              placeholder="e.g. Road No 36, Jubilee Hills"
              placeholderTextColor={theme.textMuted}
              value={address}
              onChangeText={setAddress}
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              className="border rounded-2xl px-4 py-3.5 text-base"
            />
          </View>

          <View className="mt-4">
            <Text style={{ color: theme.textSecondary }} className="font-semibold text-sm mb-2">City *</Text>
            <TextInput
              placeholder="e.g. Hyderabad"
              placeholderTextColor={theme.textMuted}
              value={city}
              onChangeText={setCity}
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              className="border rounded-2xl px-4 py-3.5 text-base"
            />
          </View>

          <View className="mt-4">
            <Text style={{ color: theme.textSecondary }} className="font-semibold text-sm mb-2">Description</Text>
            <TextInput
              placeholder="Describe property features, view, amenities..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text, textAlignVertical: "top" }}
              className="border rounded-2xl px-4 py-3.5 text-base h-28"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleAddProperty}
          disabled={loading}
          style={{ backgroundColor: theme.accent }}
          className="py-4 rounded-2xl items-center mb-12 shadow-md"
        >
          {loading ? (
            <CustomSpinner size={24} color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-base">Publish Listing</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
