import { useUser } from "@clerk/clerk-expo";
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
import { useSupabase } from "../../../hooks/useSupabase";

export default function AddProperty() {
  const { user } = useUser();
  const supabase = useSupabase();

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

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("is_admin")
        .eq("clerk_id", user.id)
        .single();

      if (userError || !userData?.is_admin) {
        Alert.alert("Permission Denied", "Only administrators are authorized to add new properties.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("properties").insert([
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
      ]);

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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-gray-900 font-semibold text-3xl">Add Property</Text>
          <Text className="text-gray-400 text-sm mt-1">Admin Panel — Create a new listing</Text>
        </View>

        {/* Form Fields */}
        <View className="space-y-4 mb-8">
          <View>
            <Text className="text-gray-700 font-semibold text-sm mb-2">Property Title *</Text>
            <TextInput
              placeholder="e.g. Modern Luxury Villa"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
              className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 text-base"
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 font-semibold text-sm mb-2">Property Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {propertyTypes.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setType(item.value)}
                  className={`px-4 py-2.5 rounded-full border ${
                    type === item.value
                      ? "bg-blue-600 border-blue-600"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      type === item.value ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 font-semibold text-sm mb-2">Price (₹) *</Text>
            <TextInput
              placeholder="e.g. 15000000"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
              className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 text-base"
            />
          </View>

          <View className="flex-row space-x-4 mt-4">
            <View className="flex-1">
              <Text className="text-gray-700 font-semibold text-sm mb-2">Bedrooms</Text>
              <View className="flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-3 py-2">
                <TouchableOpacity
                  onPress={() => setBedrooms(Math.max(1, bedrooms - 1))}
                  className="p-1.5 bg-white rounded-xl border border-gray-100 shadow-sm"
                >
                  <Ionicons name="remove" size={18} color="#374151" />
                </TouchableOpacity>
                <Text className="text-gray-900 font-semibold text-base">{bedrooms}</Text>
                <TouchableOpacity
                  onPress={() => setBedrooms(bedrooms + 1)}
                  className="p-1.5 bg-white rounded-xl border border-gray-100 shadow-sm"
                >
                  <Ionicons name="add" size={18} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-1 ml-3">
              <Text className="text-gray-700 font-semibold text-sm mb-2">Bathrooms</Text>
              <View className="flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-3 py-2">
                <TouchableOpacity
                  onPress={() => setBathrooms(Math.max(1, bathrooms - 1))}
                  className="p-1.5 bg-white rounded-xl border border-gray-100 shadow-sm"
                >
                  <Ionicons name="remove" size={18} color="#374151" />
                </TouchableOpacity>
                <Text className="text-gray-900 font-semibold text-base">{bathrooms}</Text>
                <TouchableOpacity
                  onPress={() => setBathrooms(bathrooms + 1)}
                  className="p-1.5 bg-white rounded-xl border border-gray-100 shadow-sm"
                >
                  <Ionicons name="add" size={18} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 font-semibold text-sm mb-2">Area (sq ft)</Text>
            <TextInput
              placeholder="e.g. 1800"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={area}
              onChangeText={setArea}
              className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 text-base"
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 font-semibold text-sm mb-2">Address *</Text>
            <TextInput
              placeholder="e.g. Road No 36, Jubilee Hills"
              placeholderTextColor="#9ca3af"
              value={address}
              onChangeText={setAddress}
              className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 text-base"
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 font-semibold text-sm mb-2">City *</Text>
            <TextInput
              placeholder="e.g. Hyderabad"
              placeholderTextColor="#9ca3af"
              value={city}
              onChangeText={setCity}
              className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 text-base"
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-700 font-semibold text-sm mb-2">Description</Text>
            <TextInput
              placeholder="Describe property features, view, amenities..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 text-base h-28"
              style={{ textAlignVertical: "top" }}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleAddProperty}
          disabled={loading}
          className="bg-blue-600 py-4 rounded-2xl items-center mb-12 shadow-md"
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
