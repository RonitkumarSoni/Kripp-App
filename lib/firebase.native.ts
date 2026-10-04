import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth, type Persistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const firebaseApp = getApps().length ? getApp() : initializeApp({
 apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
 authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
 projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
 appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
});
let nativeAuth: Auth;
try {
 const { getReactNativePersistence } = require('firebase/auth') as { getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence };
 nativeAuth = initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) });
} catch (error) {
 if ((error as { code?: string }).code !== 'auth/already-initialized') throw error;
 nativeAuth = getAuth(firebaseApp);
}
export const auth = nativeAuth;
