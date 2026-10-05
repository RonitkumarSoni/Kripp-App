import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { signInGoogle } from '../lib/googleSignIn';
import { Link } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { requestPasswordReset } from '../lib/passwordReset';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { usePasswordResetCooldown } from '../hooks/usePasswordResetCooldown';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export default function FirebaseAuthScreen({ signup = false }: { signup?: boolean }) {
 const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
 const [name, setName] = useState('');
 const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
 const { refresh } = useAuth(); const { secondsLeft, startCooldown } = usePasswordResetCooldown();
 const fail = (e: any) => {
  const messages: Record<string,string> = { 'auth/email-already-in-use': 'This email already has an account. Sign in instead.',
   'auth/invalid-credential': 'Email or password is incorrect.', 'auth/invalid-email': 'Enter a valid email address.',
   'auth/weak-password': 'Use a password with at least 8 characters.', 'auth/too-many-requests': 'Too many attempts. Wait and try again.',
   'auth/network-request-failed': 'Unable to connect. Check your internet connection.', 'auth/operation-not-allowed': 'Email/password login must be enabled in Firebase.' };
  setError(messages[e.code] || e.message || 'Please try again.');
 };
 const submit = async () => {
  if (busy) return;
  if (!email.trim() || !password) { setError('Enter your email and password.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) { setError('Enter a valid email address.'); return; }
  if (signup && password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
  setBusy(true); setError(''); setMessage('');
  try {
   const recipient = normalizeEmail(email);
   if (signup) {
    const credential = await createUserWithEmailAndPassword(auth, recipient, password);
    if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
    await refresh();
   } else {
    await signInWithEmailAndPassword(auth, recipient, password);
    await refresh();
   }
  } catch(e: any) {
   fail(e);
  }
  finally { setBusy(false); }
 };
 const run = async (action: () => Promise<void>) => {
  if (busy) return; setBusy(true); setError(''); setMessage('');
  try { await action(); } catch(e) { fail(e); } finally { setBusy(false); }
 };
 return <ScrollView className="flex-1 bg-white" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 32 }} keyboardShouldPersistTaps="handled">
  <Image source={require('../assets/images/kribb.png')} style={{ width: 120, height: 48, marginBottom: 24 }} resizeMode="contain" />
  <Text className="text-3xl font-semibold text-gray-900 mb-3">{signup ? 'Create your account' : 'Welcome back'}</Text>
  <Text className="text-gray-500 mb-6">{signup ? 'Create an account with your email and password.' : 'Sign in with your email and password.'}</Text>
  {signup && <TextInput value={name} onChangeText={setName} placeholder="Full name" className="border border-gray-300 rounded-xl p-4 mb-3" />}
  <TextInput value={email} onChangeText={setEmail} placeholder="Email address" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" className="border border-gray-300 rounded-xl p-4 mb-3" />
  <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry autoCapitalize="none" autoComplete={signup ? 'new-password' : 'current-password'} className="border border-gray-300 rounded-xl p-4 mb-4" />
  {!!error && <Text accessibilityRole="alert" className="text-red-600 mb-4">{error}</Text>}
  {!!message && <Text className="text-green-700 mb-4">{message}</Text>}
  <TouchableOpacity disabled={busy} onPress={submit} className="bg-blue-600 rounded-xl p-4 items-center" style={{ opacity: busy ? 0.6 : 1 }}>
   {busy ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">{signup ? 'Create account' : 'Sign in'}</Text>}
  </TouchableOpacity>
  <View className="flex-row items-center my-5"><View className="flex-1 h-px bg-gray-200" /><Text className="mx-3 text-gray-500">or</Text><View className="flex-1 h-px bg-gray-200" /></View>
  <TouchableOpacity disabled={busy} accessibilityRole="button" onPress={() => run(async () => { const result = await signInGoogle(); if (result) await refresh(); })} className="border border-gray-300 rounded-xl p-4 items-center flex-row justify-center" style={{ opacity: busy ? 0.6 : 1 }}>
   <Text style={{ color: '#4285F4', fontWeight: '700', fontSize: 20, marginRight: 12 }}>G</Text><Text className="text-gray-900 font-semibold">Continue with Google</Text>
  </TouchableOpacity>
  {!signup && <TouchableOpacity disabled={busy || secondsLeft > 0} onPress={() => run(async () => { const recipient = normalizeEmail(email); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) throw new Error('Enter a valid email address first.'); await requestPasswordReset(recipient); startCooldown(); setMessage('If an account exists, check your email for password reset instructions.'); })} className="p-4 items-center"><Text className="text-blue-600">{secondsLeft > 0 ? `Try again in ${secondsLeft}s` : 'Forgot password?'}</Text></TouchableOpacity>}
  <View className="mt-4 pb-12 items-center">
   <Link href={signup ? '/(auth)/sign-in' : '/(auth)/sign-up'} style={{ color: '#2563EB', fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' }}>
    {signup ? 'Already registered? Sign in' : 'New here? Create an account'}
   </Link>
  </View>
 </ScrollView>;
}
