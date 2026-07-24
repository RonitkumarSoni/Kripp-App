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

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!isLoaded || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn) {
      if (inAuthGroup || segments.length === 0) {
        router.replace('/(root)/(tabs)/home');
      }
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/sign-in');
    }
  }, [isSignedIn, isLoaded, segments, rootNavigationState?.key]);

  return (
    <NotificationProvider>
      <Slot />
    </NotificationProvider>
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