import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
export async function requestPasswordReset(email: string) {
 const recipient = email.trim().toLowerCase();
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) throw new Error('Enter a valid email address first.');
 auth.languageCode = 'en';
 await sendPasswordResetEmail(auth, recipient);
 return recipient;
}
