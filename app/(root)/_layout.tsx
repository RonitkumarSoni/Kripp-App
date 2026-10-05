import { Stack } from "expo-router";
import { useUserSync } from "../../hooks/useUserSync";
import React from "react";

export default function ProtectedLayout() {
  // Sync Firebase user to Firestore when inside protected layout
  useUserSync();

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 150 }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
