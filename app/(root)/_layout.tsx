import { Slot } from "expo-router";
import { useUserSync } from "../../hooks/useUserSync";
import React from "react";

export default function ProtectedLayout() {
  // Sync Clerk user to Supabase when inside protected layout
  useUserSync();

  return <Slot />;
}
