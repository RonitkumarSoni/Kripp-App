import React from "react";
import { Modal, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFilterStore } from "../store/filterStore";

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <Text className="text-xl font-semibold text-gray-900">Filters</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Property Type */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Property Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(type === t ? null : t)}
                    className={`px-4 py-2 rounded-full border ${
                      type === t
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold capitalize ${
                        type === t ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bedrooms */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Bedrooms
              </Text>
              <View className="flex-row gap-3">
                {BEDROOM_OPTIONS.map((b) => (
                  <TouchableOpacity
                    key={b}
                    onPress={() => setBedrooms(bedrooms === b ? null : b)}
                    className={`flex-1 py-3 rounded-2xl border items-center ${
                      bedrooms === b
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        bedrooms === b ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {b === 4 ? "4+" : b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row gap-3 pt-4 border-t border-gray-100 mt-2">
            <TouchableOpacity
              onPress={resetFilters}
              className="flex-1 py-3.5 rounded-2xl border border-gray-200 items-center"
            >
              <Text className="text-gray-700 font-semibold">Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-blue-600 items-center"
            >
              <Text className="text-white font-semibold">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
