import React from "react";
import { Modal, Text, TouchableOpacity, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onTakeAction: () => void;
  onChooseAction: () => void;
  title?: string;
}

export default function ImagePickerModal({
  visible,
  onClose,
  onTakeAction,
  onChooseAction,
  title = "Select Photo",
}: ImagePickerModalProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        
        <View
          style={{
            backgroundColor: theme.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 40,
          }}
        >
          <View className="items-center mb-6">
            <View className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
          </View>
          
          <Text style={{ color: theme.text }} className="text-xl font-bold mb-6">
            {title}
          </Text>
          
          <View className="flex-row justify-around mb-2">
            <TouchableOpacity
              onPress={() => {
                onClose();
                setTimeout(() => {
                  onTakeAction();
                }, 500);
              }}
              className="items-center justify-center p-4"
            >
              <View style={{ backgroundColor: theme.card }} className="w-16 h-16 rounded-full items-center justify-center mb-2 shadow-sm border border-gray-100 dark:border-gray-800">
                <Ionicons name="camera" size={28} color={theme.accent} />
              </View>
              <Text style={{ color: theme.textSecondary }} className="font-medium text-sm">Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onClose();
                setTimeout(() => {
                  onChooseAction();
                }, 500);
              }}
              className="items-center justify-center p-4"
            >
              <View style={{ backgroundColor: theme.card }} className="w-16 h-16 rounded-full items-center justify-center mb-2 shadow-sm border border-gray-100 dark:border-gray-800">
                <Ionicons name="image" size={28} color={theme.accent} />
              </View>
              <Text style={{ color: theme.textSecondary }} className="font-medium text-sm">Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
