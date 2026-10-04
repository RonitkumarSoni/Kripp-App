import { Slot } from "expo-router";
import { useUserSync } from "../../hooks/useUserSync";
import React from "react";

export default function ProtectedLayout() {
  // Sync Firebase user to Firestore when inside protected layout
  useUserSync();

  return <Slot />;
}
