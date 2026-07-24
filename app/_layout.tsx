import { Slot, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import React, { useEffect } from 'react';
import "../global.css";

// DOMException polyfill - React Native mein ye nahi hota, Supabase ko chahiye
if (typeof globalThis.DOMException === 'undefined') {
  (globalThis as any).DOMException = class DOMException extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name || 'DOMException';
    }
  };
}

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

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const supabase = useSupabase();

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

  return (
    <ThemeProvider>
      <NotificationProvider>
        <Slot />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  );
}