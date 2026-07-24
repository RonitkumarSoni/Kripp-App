import { useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import React from "react";

export default function AuthRoutesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}