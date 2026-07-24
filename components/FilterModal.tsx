import React from "react";
import { Modal, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFilterStore } from "../store/filterStore";
import { useTheme } from "../context/ThemeContext";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

const TYPES = ["apartment", "house", "villa", "studio"];
const BEDROOM_OPTIONS = [1, 2, 3, 4];

export default function FilterModal({ visible, onClose }: FilterModalProps) {
  const {
    type,
    bedrooms,
    setType,
    setBedrooms,
    resetFilters,
  } = useFilterStore();
  
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View style={{ backgroundColor: theme.card }} className="rounded-t-3xl p-6 max-h-[80%]">
          {/* Header */}
          <View style={{ borderBottomColor: theme.cardBorder }} className="flex-row items-center justify-between pb-4 border-b mb-5">
            <Text style={{ color: theme.text }} className="text-xl font-semibold">Filters</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Property Type */}
            <View className="mb-6">
              <Text style={{ color: theme.textSecondary }} className="text-sm font-semibold mb-3">
                Property Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(type === t ? null : t)}
                    style={{
                      backgroundColor: type === t ? theme.accent : theme.inputBg,
                      borderColor: type === t ? theme.accent : theme.inputBorder
                    }}
                    className="px-4 py-2 rounded-full border"
                  >
                    <Text
                      className="text-sm font-semibold capitalize"
                      style={{ color: type === t ? "#FFF" : theme.textSecondary }}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bedrooms */}
            <View className="mb-6">
              <Text style={{ color: theme.textSecondary }} className="text-sm font-semibold mb-3">
                Bedrooms
              </Text>
              <View className="flex-row gap-3">
                {BEDROOM_OPTIONS.map((b) => (
                  <TouchableOpacity
                    key={b}
                    onPress={() => setBedrooms(bedrooms === b ? null : b)}
                    style={{
                      backgroundColor: bedrooms === b ? theme.accent : theme.inputBg,
                      borderColor: bedrooms === b ? theme.accent : theme.inputBorder
                    }}
                    className="flex-1 py-3 rounded-2xl border items-center"
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: bedrooms === b ? "#FFF" : theme.textSecondary }}
                    >
                      {b === 4 ? "4+" : b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={{ borderTopColor: theme.cardBorder }} className="flex-row gap-3 pt-4 border-t mt-2">
            <TouchableOpacity
              onPress={resetFilters}
              style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
              className="flex-1 py-3.5 rounded-2xl border items-center"
            >
              <Text style={{ color: theme.text }} className="font-semibold">Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={{ backgroundColor: theme.accent }}
              className="flex-1 py-3.5 rounded-2xl items-center"
            >
              <Text className="text-white font-semibold">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
