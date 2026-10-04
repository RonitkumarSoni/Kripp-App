import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../../context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomSpinner from "../../../components/CustomSpinner";
import ImagePickerModal from "../../../components/ImagePickerModal";
import { uploadImages } from "../../../lib/images";
import * as database from "../../../lib/database";
import { useInAppNotification } from "../../../context/NotificationContext";
import { useTheme } from "../../../context/ThemeContext";
import { MESSAGES } from "../../../constants/messages";

const TYPES = ["apartment", "house", "villa", "studio"] as const;
type PropertyType = (typeof TYPES)[number];

const MIN_PRICE = 1;
const MAX_PRICE = 999_999_999;

const sectionClass = "mb-5";

interface FormState {
  title: string;
  description: string;
  price: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqft: string;
  address: string;
  city: string;
  isFeatured: boolean;
  images: string[];
}

export default function EditPropertyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const { showNotification } = useInAppNotification();
  const { theme } = useTheme();

  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const { data, error } = await database.getProperty(String(id));

      if (error) throw error;

      if (data) {
        setForm({
          title: data.title || "",
          description: data.description || "",
          price: data.price ? String(data.price) : "",
          type: (data.type as PropertyType) || "apartment",
          bedrooms: data.bedrooms || 1,
          bathrooms: data.bathrooms || 1,
          areaSqft: data.area_sqft ? String(data.area_sqft) : "",
          address: data.address || "",
          city: data.city || "",
          isFeatured: data.is_featured || false,
          images: data.images || [],
        });
      }
    } catch (err) {
      console.error("Error fetching property:", err);
      Alert.alert("Error", "Could not fetch property details.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (fields: Partial<FormState>) =>
    setForm((prev) => (prev ? { ...prev, ...fields } : null));

  const inputClass = "border rounded-2xl px-4 py-3 outline-none";
  const labelClass = "text-sm font-semibold mb-1.5";

  const processImageResult = async (result: any) => {
    if (result.canceled) return;
    const uris = result.assets.map((asset: any) => asset.uri);
    if (form) {
      updateForm({ images: [...form.images, ...uris] });
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          if (canAskAgain) {
            Alert.alert("Permission Required", MESSAGES.PERMISSIONS.GALLERY_REQUIRED);
          }
          return;
        }
        setUploadingImages(true);
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          quality: 0.7,
          selectionLimit: 6 - (form?.images?.length || 0),
        });
        await processImageResult(result);
      }
    } catch (err) {
      console.error("Gallery picker error:", err);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          if (canAskAgain) {
            Alert.alert("Permission Required", MESSAGES.PERMISSIONS.CAMERA_REQUIRED);
          }
          return;
        }
        setUploadingImages(true);
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.7,
        });
        await processImageResult(result);
      }
    } catch (err) {
      console.error("Camera picker error:", err);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (form) {
      updateForm({
        images: form.images.filter((_, i) => i !== index),
      });
    }
  };

  const handleSubmit = async () => {
    if (!form) return;

    if (!form.title.trim())
      return Alert.alert("Validation", MESSAGES.VALIDATION.TITLE_REQUIRED);
    if (!form.price.trim())
      return Alert.alert("Validation", MESSAGES.VALIDATION.PRICE_REQUIRED);

    const numPrice = Number(form.price);
    if (isNaN(numPrice) || numPrice < MIN_PRICE)
      return Alert.alert("Validation", MESSAGES.VALIDATION.PRICE_MIN);
    if (numPrice > MAX_PRICE)
      return Alert.alert("Validation", MESSAGES.VALIDATION.PRICE_MAX(MAX_PRICE));

    if (!form.address.trim())
      return Alert.alert("Validation", MESSAGES.VALIDATION.ADDRESS_REQUIRED);
    if (!form.city.trim())
      return Alert.alert("Validation", MESSAGES.VALIDATION.CITY_REQUIRED);
    if (form.images.length === 0)
      return Alert.alert("Validation", MESSAGES.VALIDATION.IMAGE_REQUIRED);

    setSubmitting(true);

    try {
      const { error } = await database.editProperty(String(id), {
          title: form.title.trim(),
          description: form.description.trim(),
          price: numPrice,
          type: form.type,
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          area_sqft: form.areaSqft ? Number(form.areaSqft) : null,
          address: form.address.trim(),
          city: form.city.trim(),
          is_featured: form.isFeatured,
          images: await uploadImages(form.images),
        });

      if (error) throw error;

      showNotification({
        title: "Updated Successfully",
        body: MESSAGES.PROPERTY.UPDATE_SUCCESS,
        type: "success",
      });
      router.back();
    } catch (e) {
      console.error("Submit error:", e);
      showNotification({
        title: "Error",
        body: MESSAGES.PROPERTY.UPDATE_ERROR,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const Counter = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) => (
    <View className="flex-1">
      <Text style={{ color: theme.textSecondary }} className={labelClass}>{label}</Text>
      <View style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }} className="flex-row items-center border rounded-2xl overflow-hidden">
        <TouchableOpacity
          onPress={() => onChange(Math.max(1, value - 1))}
          className="w-11 h-11 items-center justify-center"
        >
          <Ionicons name="remove" size={18} color={theme.text} />
        </TouchableOpacity>
        <Text style={{ color: theme.text }} className="flex-1 text-center font-bold text-base">
          {value}
        </Text>
        <TouchableOpacity
          onPress={() => onChange(value + 1)}
          className="w-11 h-11 items-center justify-center"
        >
          <Ionicons name="add" size={18} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const Toggle = ({
    label,
    value,
    onChange,
    description,
  }: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
    description?: string;
  }) => (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      className="flex-row items-center justify-between p-4 rounded-2xl border"
      style={{
        backgroundColor: value ? theme.accentLight : theme.inputBg,
        borderColor: value ? theme.accent : theme.inputBorder
      }}
    >
      <View className="flex-1 mr-3">
        <Text
          className="font-semibold"
          style={{ color: value ? theme.accent : theme.text }}
        >
          {label}
        </Text>
        {description && (
          <Text style={{ color: theme.textMuted }} className="text-xs mt-0.5">{description}</Text>
        )}
      </View>
      <View
        className="w-6 h-6 rounded-full border-2 items-center justify-center"
        style={{
          backgroundColor: value ? theme.accent : 'transparent',
          borderColor: value ? theme.accent : theme.textMuted
        }}
      >
        {value && <Ionicons name="checkmark" size={14} color="white" />}
      </View>
    </TouchableOpacity>
  );

  if (loading || !form) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, alignItems: "center", justifyContent: "center" }}>
        <CustomSpinner size={40} color={theme.textMuted} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View style={{ borderBottomColor: theme.cardBorder }} className="flex-row items-center px-4 py-3 border-b">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={{ color: theme.text }} className="text-lg font-bold ml-2">
            Edit Property
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Images */}
          <View className={sectionClass}>
            <Text style={{ color: theme.textSecondary }} className={labelClass}>
              Photos{" "}
              <Text style={{ color: theme.textMuted }} className="font-normal">(up to 6)</Text>
            </Text>

            <View className="flex-row flex-wrap gap-3 mt-2">
              {form.images.map((uri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri }}
                    style={{ width: 96, height: 96, borderRadius: 16 }}
                    resizeMode="cover"
                  />
                  {index === 0 && (
                    <View style={{ backgroundColor: theme.accent }} className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full">
                      <Text className="text-white text-[9px] font-bold">
                        COVER
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full items-center justify-center"
                  >
                    <Ionicons name="close" size={11} color="white" />
                  </TouchableOpacity>
                </View>
              ))}

              {form.images.length < 6 && (
                <TouchableOpacity
                  onPress={() => setShowImagePicker(true)}
                  disabled={uploadingImages}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed items-center justify-center"
                >
                  {uploadingImages ? (
                    <CustomSpinner size={24} color={theme.textMuted} />
                  ) : (
                    <>
                      <Ionicons
                        name="camera-outline"
                        size={22}
                        color={theme.textMuted}
                      />
                      <Text style={{ color: theme.textMuted }} className="text-xs mt-1">Add</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Basic Info */}
          <View className={sectionClass}>
            <Text style={{ color: theme.textSecondary }} className={labelClass}>Title</Text>
            <TextInput
              className={inputClass}
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              placeholder="e.g. Modern 3BHK in Bandra"
              placeholderTextColor={theme.textMuted}
              value={form.title}
              onChangeText={(v) => updateForm({ title: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text style={{ color: theme.textSecondary }} className={labelClass}>Description</Text>
            <TextInput
              className={`${inputClass} h-24`}
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              placeholder="Describe the property..."
              placeholderTextColor={theme.textMuted}
              value={form.description}
              onChangeText={(v) => updateForm({ description: v })}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Price */}
          <View className={sectionClass}>
            <Text style={{ color: theme.textSecondary }} className={labelClass}>Price (₹)</Text>
            <TextInput
              className={inputClass}
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              placeholder="e.g. 5000000"
              placeholderTextColor={theme.textMuted}
              value={form.price}
              onChangeText={(v) => updateForm({ price: v })}
              keyboardType="numeric"
            />
          </View>

          {/* Property Type */}
          <View className={sectionClass}>
            <Text style={{ color: theme.textSecondary }} className={labelClass}>Property Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => updateForm({ type: t })}
                  style={{
                    backgroundColor: form.type === t ? theme.accent : theme.inputBg,
                    borderColor: form.type === t ? theme.accent : theme.inputBorder
                  }}
                  className="px-4 py-2 rounded-full border"
                >
                  <Text
                    className="text-sm font-semibold capitalize"
                    style={{ color: form.type === t ? "#FFF" : theme.textSecondary }}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bedrooms / Bathrooms */}
          <View className="flex-row gap-4 mb-5">
            <Counter
              label="Bedrooms"
              value={form.bedrooms}
              onChange={(v) => updateForm({ bedrooms: v })}
            />
            <Counter
              label="Bathrooms"
              value={form.bathrooms}
              onChange={(v) => updateForm({ bathrooms: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text style={{ color: theme.textSecondary }} className={labelClass}>Area (sq ft)</Text>
            <TextInput
              className={inputClass}
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              placeholder="e.g. 1200"
              placeholderTextColor={theme.textMuted}
              value={form.areaSqft}
              onChangeText={(v) => updateForm({ areaSqft: v })}
              keyboardType="numeric"
            />
          </View>

          {/* Location */}
          <View className={sectionClass}>
            <Text style={{ color: theme.textSecondary }} className={labelClass}>Address</Text>
            <TextInput
              className={inputClass}
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              placeholder="Street address"
              placeholderTextColor={theme.textMuted}
              value={form.address}
              onChangeText={(v) => updateForm({ address: v })}
            />
          </View>

          <View className={sectionClass}>
            <Text style={{ color: theme.textSecondary }} className={labelClass}>City</Text>
            <TextInput
              className={inputClass}
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
              placeholder="e.g. Mumbai"
              placeholderTextColor={theme.textMuted}
              value={form.city}
              onChangeText={(v) => updateForm({ city: v })}
            />
          </View>

          {/* Toggles */}
          <View className="gap-3 mb-5">
            <Toggle
              label="Featured Property"
              description="Show this in the Featured section on home"
              value={form.isFeatured}
              onChange={(v) => updateForm({ isFeatured: v })}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{ backgroundColor: theme.accent, opacity: submitting ? 0.7 : 1 }}
            className="rounded-2xl py-4 items-center"
          >
            {submitting ? (
              <CustomSpinner size={24} color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">
                Update Property
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onTakeAction={handleTakePhoto}
        onChooseAction={handleChooseFromGallery}
        title="Edit Property Photos"
      />
    </SafeAreaView>
  );
}
