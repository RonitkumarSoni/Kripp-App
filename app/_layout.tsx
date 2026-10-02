import { Slot, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { Platform, View, Image, ActivityIndicator, StyleSheet, Text } from 'react-native';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import "../global.css";

// DOMException polyfill is handled in index.js

const createTokenCache = () => {
  return {
    async getToken(key: string) {
      try {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
          }
          return null;
        }
        const item = await SecureStore.getItemAsync(key);
        return item;
      } catch (error) {
        console.error('SecureStore get item error: ', error);
        if (Platform.OS !== 'web') {
          await SecureStore.deleteItemAsync(key).catch(() => {});
        }
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
          }
          return;
        }
        return SecureStore.setItemAsync(key, value);
      } catch (err) {
        console.error('SecureStore save item error: ', err);
        return;
      }
    },
  };
};

const tokenCache = createTokenCache();
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

import { NotificationProvider } from "../context/NotificationContext";
import { ThemeProvider } from "../context/ThemeContext";

import { useSupabase } from "../hooks/useSupabase";
import { useUser } from "@clerk/clerk-expo";

// Branded loading screen — shown while Clerk is initializing
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
  const { user: clerkUser } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const supabase = useSupabase();

  useEffect(() => {
    // Hide the native splash screen immediately so our custom branded loading screen is visible
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoaded || !rootNavigationState?.key) return;

    const syncUser = async () => {
      if (isSignedIn && clerkUser) {
        try {
          await supabase.from("users").upsert(
            {
              clerk_id: clerkUser.id,
              email: clerkUser.primaryEmailAddress?.emailAddress,
              first_name: clerkUser.firstName,
              last_name: clerkUser.lastName,
              avatar_url: clerkUser.imageUrl,
            },
            { onConflict: "clerk_id" }
          );
        } catch (error) {
          console.error("Error syncing user to Supabase:", error);
        }
      }
    };

    syncUser();

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && inAuthGroup) {
      // If signed in and on an auth screen, go to home
      router.replace('/(root)/(tabs)/home');
    } else if (!isSignedIn && !inAuthGroup) {
      // If not signed in and not on auth screen, go to sign in
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded, segments, rootNavigationState?.key, clerkUser]);

  // Show branded loading screen while Clerk is initializing
  if (!isLoaded) {
    return <AppLoadingScreen />;
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        <StatusBar style="auto" />
        <Slot />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <InitialLayout />
    </ClerkProvider>
  );
}