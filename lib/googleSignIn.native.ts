import Constants from 'expo-constants';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';

export async function signInGoogle() {
 if (Constants.appOwnership === 'expo') throw new Error('Google sign-in needs the Kribb APK or a development build.');
 const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
 const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
 if (!webClientId) throw new Error('Google sign-in is not configured.');
 GoogleSignin.configure({ webClientId });
 try {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) return null;
  if (!response.data.idToken) throw new Error('Google did not return a sign-in token.');
  return await signInWithCredential(auth, GoogleAuthProvider.credential(response.data.idToken));
 } catch (error) {
  if (isErrorWithCode(error)) {
   if (error.code === statusCodes.SIGN_IN_CANCELLED) return null;
   if (error.code === statusCodes.IN_PROGRESS) throw new Error('Google sign-in is already in progress.');
   if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) throw new Error('Update Google Play services and try again.');
   if (error.code === '10') throw new Error('This APK signing certificate is not registered for Google sign-in.');
  }
  throw error;
 }
}
export async function clearGoogleSession() {
 if (Constants.appOwnership === 'expo') return;
 const { GoogleSignin } = require('@react-native-google-signin/google-signin') as typeof import('@react-native-google-signin/google-signin');
 await GoogleSignin.signOut();
}

