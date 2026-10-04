import { useAuth, useUser } from "../../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import UserAvatar from "../../../components/UserAvatar";
import CustomSpinner from "../../../components/CustomSpinner";
import ImagePickerModal from "../../../components/ImagePickerModal";
import { useTheme } from "../../../context/ThemeContext";
import { MESSAGES } from "../../../constants/messages";

export default function ProfileScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const { theme } = useTheme();

  const [showImagePicker, setShowImagePicker] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const processImageResult = async (result: any) => {
    if (result.canceled || !result.assets?.[0]) return;
    setIsUpdating(true);
    try {
      const asset = result.assets[0];
      if (asset.base64) {
        const filename = asset.uri.split("/").pop() || "profile.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${asset.base64}`;
        await user?.setProfileImage({ file: dataUrl });
      }
      Alert.alert("Success", MESSAGES.PROFILE.IMAGE_UPDATE_SUCCESS);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", MESSAGES.PROFILE.IMAGE_UPDATE_ERROR);
    } finally {
      setIsUpdating(false);
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
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });
        await processImageResult(result);
      } else {
        if (typeof document !== "undefined") {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = async (event: any) => {
                setIsUpdating(true);
                try {
                  const dataUrl = event.target.result;
                  await user?.setProfileImage({ file: dataUrl });
                } catch (error) {
                  Alert.alert("Error", MESSAGES.PROFILE.IMAGE_UPDATE_ERROR);
                } finally {
                  setIsUpdating(false);
                }
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        }
      }
    } catch (error) {
      console.error("Gallery picker error:", error);
      setIsUpdating(false);
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
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });
        await processImageResult(result);
      }
    } catch (error) {
      console.error("Camera picker error:", error);
      setIsUpdating(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <CustomSpinner size={40} color={theme.textMuted} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, paddingBottom: 80 }}>
      {/* Avatar + Name */}
      <View className="items-center py-8">
        <View className="relative mb-4">
          <UserAvatar uri={user.imageUrl} name={`${user.firstName} ${user.lastName}`} email={user.primaryEmailAddress.emailAddress} />
          <TouchableOpacity
            onPress={() => setShowImagePicker(true)}
            disabled={isUpdating}
            style={{ backgroundColor: theme.accent }}
            className="absolute bottom-1 right-0 rounded-full p-2"
          >
            {isUpdating ? (
              <CustomSpinner size={16} color="white" />
            ) : (
              <Ionicons name="camera" size={16} color="white" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={{ color: theme.text }} className="text-xl font-semibold">
          {user.firstName} {user.lastName}
        </Text>
        <Text style={{ color: theme.textSecondary }} className="mt-1">
          {user.emailAddresses?.[0]?.emailAddress}
        </Text>
      </View>

      {/* Menu Items */}
      <View className="px-6 gap-2">
        <MenuItem
          icon="business-outline"
          label="My Properties"
          onPress={() => router.push("/(root)/my-properties")}
          theme={theme}
        />
        <MenuItem
          icon="heart-outline"
          label="Saved Properties"
          onPress={() => router.push("/(root)/(tabs)/saved")}
          theme={theme}
        />
        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() => router.push("/(root)/notification")}
          theme={theme}
        />
        <MenuItem
          icon="settings-outline"
          label="Settings"
          onPress={() => router.push("/(root)/(tabs)/setting")}
          theme={theme}
        />
        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() =>
            Linking.openURL(
              "mailto:piyushagarwalvo@gmail.com?subject=Help%20%26%20Support%20-%20Kribb%20App"
            )
          }
          theme={theme}
        />
      </View>

      {/* Sign Out */}
      <View className="px-6 mt-auto mb-8">
        <TouchableOpacity
          onPress={handleSignOut}
          style={{ backgroundColor: theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2', borderColor: theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }}
          className="flex-row items-center justify-center gap-2 py-4 rounded-2xl border"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-500 font-semibold text-base">Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onTakeAction={handleTakePhoto}
        onChooseAction={handleChooseFromGallery}
        title="Profile Photo"
      />
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  theme: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ backgroundColor: theme.card }}
      className="flex-row items-center gap-4 px-4 py-4 rounded-2xl mb-2"
    >
      <Ionicons name={icon} size={22} color={theme.textSecondary} />
      <Text style={{ color: theme.text }} className="flex-1 font-medium text-base">
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </TouchableOpacity>
  );
}
