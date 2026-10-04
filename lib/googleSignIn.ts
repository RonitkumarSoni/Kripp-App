import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
export async function signInGoogle() {
 try { return await signInWithPopup(auth, new GoogleAuthProvider()); }
 catch (error: any) {
  if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return null;
  throw error;
 }
}
export const clearGoogleSession = async () => {};
