import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { MESSAGES } from "../../../constants/messages";

import CustomSpinner from "../../../components/CustomSpinner";
import ImagePickerModal from "../../../components/ImagePickerModal";
import { useSupabase } from "../../../hooks/useSupabase";
import { useInAppNotification } from "../../../context/NotificationContext";
import { useTheme } from "../../../context/ThemeContext";

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
  latitude: string;
  longitude: string;
  isFeatured: boolean;
  images: string[];
  localImages: string[];
}

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  price: "",
  type: "apartment",
  bedrooms: 1,
  bathrooms: 1,
  areaSqft: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  isFeatured: false,
  images: [],
  localImages: [],
};

export default function CreatePropertyScreen() {
  const router = useRouter();
  const { user } = useUser();
  const authSupabase = useSupabase();
  const { showNotification } = useInAppNotification();
  const { theme } = useTheme();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [tempCoords, setTempCoords] = useState<{lat: number, lng: number} | null>(null);

  const updateForm = (fields: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const inputClass = "border rounded-2xl px-4 py-3 outline-none";
  const labelClass = "text-sm font-semibold mb-1.5";

  const [showImagePicker, setShowImagePicker] = useState(false);

  const processImageResult = async (result: any) => {
    if (result.canceled) return;
    const uris = result.assets.map((asset: any) => asset.uri);
    updateForm({
      images: [...form.images, ...uris],
      localImages: [...form.localImages, ...uris],
    });
  };

  const handleChooseFromGallery = async () => {
    try {
      if (Platform.OS !== "web") {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission Required", "Please allow access to your photo library.");
          return;
        }
        setUploadingImages(true);
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          quality: 0.7,
          selectionLimit: 6 - form.localImages.length,
        });
        await processImageResult(result);
      } else {
        if (typeof document !== "undefined") {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.multiple = true;
          input.onchange = (e: any) => {
            const files = Array.from(e.target.files || []);
            const uris = files.map((file: any) => URL.createObjectURL(file));
            updateForm({
              images: [...form.images, ...uris],
              localImages: [...form.localImages, ...uris],
            });
          };
          input.click();
        }
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
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission Required", "Please allow access to your device camera.");
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
    updateForm({
      images: form.images.filter((_, i) => i !== index),
      localImages: form.localImages.filter((_, i) => i !== index),
    });
  };

  // ─── Location Detection ────────────────────────────────────
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            updateForm({
              latitude: String(position.coords.latitude),
              longitude: String(position.coords.longitude),
            });
            setDetectingLocation(false);
          },
          () => {
            Alert.alert("Error", "Could not detect location. Enter manually.");
            setDetectingLocation(false);
          }
        );
        return;
      }

      const Location = require("expo-location");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to detect coordinates."
        );
        setDetectingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      updateForm({
        latitude: String(location.coords.latitude),
        longitude: String(location.coords.longitude),
      });
    } catch (err) {
      Alert.alert("Error", "Could not detect location. Enter manually.");
    } finally {
      setDetectingLocation(false);
    }
  };

  // ─── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim())
      return Alert.alert("Validation", "Title is required.");

    if (!form.price.trim())
      return Alert.alert("Validation", "Price is required.");

    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum < MIN_PRICE)
      return Alert.alert("Validation", "Price must be greater than ₹0.");
    if (priceNum > MAX_PRICE)
      return Alert.alert(
        "Validation",
        `Price cannot exceed ₹${MAX_PRICE.toLocaleString("en-IN")}.`
      );

    if (!form.address.trim())
      return Alert.alert("Validation", "Address is required.");
    if (!form.city.trim())
      return Alert.alert("Validation", "City is required.");
    if (form.images.length === 0)
      return Alert.alert("Validation", "Please upload at least one image.");

    setSubmitting(true);

    try {
      const { error } = await authSupabase.from("properties").insert({
        owner_clerk_id: user?.id || null,
        title: form.title.trim(),
        description: form.description.trim(),
        price: priceNum,
        type: form.type,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        area_sqft: form.areaSqft ? Number(form.areaSqft) : null,
        address: form.address.trim(),
        city: form.city.trim(),
        latitude: form.latitude ? Number(form.latitude) : 17.4065,
        longitude: form.longitude ? Number(form.longitude) : 78.4772,
        images: form.images,
        is_featured: form.isFeatured,
        is_sold: false,
      });

      if (error) {
        console.error("Supabase insert error:", error);
        showNotification({
          title: "Failed to List",
          body: error.message || "Something went wrong. Please try again.",
          type: "error",
        });
        setSubmitting(false);
        return;
      }
    } catch (e) {
      console.error("Submit error:", e);
      showNotification({
        title: "Error",
        body: "Could not create property. Check your connection.",
        type: "error",
      });
      setSubmitting(false);
      return;
    } finally {
      setSubmitting(false);
    }

    setForm(INITIAL_FORM);
    showNotification({
      title: "Listed Successfully",
      body: "Your property is now live on Kribb.",
      type: "success",
    });
    router.replace("/(root)/(tabs)/home");
  };

  // ─── UI Helpers ────────────────────────────────────────────
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-3">
          <Text style={{ color: theme.text }} className="text-2xl font-semibold flex-1">
            Add Property
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

            <View className="flex-row flex-wrap gap-3">
              {form.localImages.map((uri, index) => (
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

              {form.localImages.length < 6 && (
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
            <Text style={{ color: theme.textMuted }} className="text-xs mt-1.5 ml-1">
              Valid range: ₹1 – ₹{MAX_PRICE.toLocaleString("en-IN")}
            </Text>
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

          {/* Coordinates */}
          <View className={sectionClass}>
            <View className="flex-row items-center justify-between mb-1.5">
              <Text style={{ color: theme.textSecondary }} className={labelClass}>Coordinates</Text>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() => {
                    setTempCoords({ lat: Number(form.latitude) || 19.0760, lng: Number(form.longitude) || 72.8777 });
                    setShowMapPicker(true);
                  }}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, borderWidth: 1 }}
                  className="w-8 h-8 rounded-full items-center justify-center"
                >
                  <Ionicons name="map-outline" size={16} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDetectLocation}
                  disabled={detectingLocation}
                  style={{ backgroundColor: theme.accentLight }}
                  className="flex-row items-center gap-1 px-3 py-1.5 rounded-full"
                >
                  {detectingLocation ? (
                    <CustomSpinner size={14} color={theme.accent} />
                  ) : (
                    <Ionicons name="locate-outline" size={13} color={theme.accent} />
                  )}
                  <Text style={{ color: theme.accent }} className="text-xs font-semibold">
                    {detectingLocation ? "Detecting..." : "Detect Location"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  className={inputClass}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  placeholder="Latitude"
                  placeholderTextColor={theme.textMuted}
                  value={form.latitude}
                  onChangeText={(v) => updateForm({ latitude: v })}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <TextInput
                  className={inputClass}
                  style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }}
                  placeholder="Longitude"
                  placeholderTextColor={theme.textMuted}
                  value={form.longitude}
                  onChangeText={(v) => updateForm({ longitude: v })}
                  keyboardType="numeric"
                />
              </View>
            </View>
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
            disabled={submitting || uploadingImages}
            style={{ backgroundColor: theme.accent, opacity: submitting || uploadingImages ? 0.7 : 1 }}
            className="rounded-2xl py-4 items-center"
          >
            {submitting ? (
              <CustomSpinner size={24} color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">
                List Property
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Map Picker Modal */}
      <Modal
        visible={showMapPicker}
        animationType="slide"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
          <View style={{ borderBottomColor: theme.cardBorder }} className="flex-row items-center justify-between px-4 py-3 border-b">
            <TouchableOpacity onPress={() => setShowMapPicker(false)}>
              <Text style={{ color: theme.textMuted }} className="font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
            <Text style={{ color: theme.text }} className="font-bold text-lg">Pick Location</Text>
            <TouchableOpacity onPress={() => {
              if (tempCoords) {
                updateForm({
                  latitude: String(tempCoords.lat),
                  longitude: String(tempCoords.lng)
                });
              }
              setShowMapPicker(false);
            }}>
              <Text style={{ color: theme.accent }} className="font-semibold text-base">Done</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1">
            <WebView
              source={{
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                      <style>body { padding: 0; margin: 0; } html, body, #map { height: 100%; width: 100vw; }</style>
                  </head>
                  <body>
                      <div id="map"></div>
                      <script>
                          var initialLat = ${form.latitude || 19.0760};
                          var initialLng = ${form.longitude || 72.8777};
                          var map = L.map('map').setView([initialLat, initialLng], 12);
                          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '© OpenStreetMap contributors'
                          }).addTo(map);
                          var marker = L.marker([initialLat, initialLng], {draggable: true}).addTo(map);
                          
                          function sendCoords(lat, lng) {
                              window.ReactNativeWebView.postMessage(JSON.stringify({lat: lat, lng: lng}));
                          }
                          
                          marker.on('dragend', function (e) {
                              var coords = e.target.getLatLng();
                              sendCoords(coords.lat, coords.lng);
                          });
                          
                          map.on('click', function(e) {
                              marker.setLatLng(e.latlng);
                              sendCoords(e.latlng.lat, e.latlng.lng);
                          });
                      </script>
                  </body>
                  </html>
                `
              }}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  setTempCoords(data);
                } catch(e) {}
              }}
              javaScriptEnabled={true}
              scrollEnabled={false}
              style={{ flex: 1 }}
            />
          </View>
          <View style={{ backgroundColor: theme.bg }} className="p-4 items-center">
            <Text style={{ color: theme.textMuted }}>Tap anywhere on the map or drag the marker.</Text>
          </View>
        </SafeAreaView>
      </Modal>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onTakeAction={handleTakePhoto}
        onChooseAction={handleChooseFromGallery}
        title="Add Property Photos"
      />
    </SafeAreaView>
  );
}
