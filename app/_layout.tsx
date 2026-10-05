import { Slot, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, Image, ActivityIndicator, StyleSheet, Text } from 'react-native';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import "../global.css";

// DOMException polyfill is handled in index.js

import { NotificationProvider } from "../context/NotificationContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

// StatusBar that reads theme from context — must be rendered inside ThemeProvider
function ThemedStatusBar() {
  const { theme } = useTheme();
  // @ts-ignore
  return <StatusBar style={theme.statusBar} backgroundColor={theme.bg} />;
}

// Branded loading screen — shown while Firebase is initializing
function AppLoadingScreen() {
  return (
    <View style={splashStyles.container}>
      <Image
        source={require('../assets/images/kribb.png')}
        style={splashStyles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#2563EB" style={splashStyles.spinner} />
      <Text style={splashStyles.tagline}>Finding your dream home...</Text>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 56,
    marginBottom: 32,
  },
  spinner: {
    marginBottom: 16,
  },
  tagline: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Hide the native splash screen immediately so our branded loading screen shows
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoaded || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && inAuthGroup) {
      router.replace('/(root)/(tabs)/home');
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded, segments, rootNavigationState?.key]);

  // Show branded loading screen while Firebase is initializing
  if (!isLoaded) {
    return <AppLoadingScreen />;
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        <ThemedStatusBar />
        <Slot />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
