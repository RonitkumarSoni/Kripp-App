import { useAuth } from "../../context/AuthContext";
import { Stack } from "expo-router";
import React from "react";

export default function AuthRoutesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}