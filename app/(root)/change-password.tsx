import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/AuthContext';
import { requestPasswordReset } from '../../lib/passwordReset';
import { usePasswordResetCooldown } from '../../hooks/usePasswordResetCooldown';
export default function ChangePasswordScreen() {
 const router = useRouter(); const { theme } = useTheme(); const { user } = useUser();
 const { secondsLeft, startCooldown } = usePasswordResetCooldown();
 const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
 const email = user?.primaryEmailAddress.emailAddress || '';
 const reset = async () => {
  if (busy || secondsLeft) return;
  setBusy(true); setError(''); setMessage('');
  try { await requestPasswordReset(email); startCooldown(); setMessage(`Reset requested for ${email}. Check Inbox and Spam, then open the link to choose a new password.`); }
  catch (e: any) { setError(e.code === 'auth/too-many-requests' ? 'Too many requests. Wait a few minutes and try again.' : e.code === 'auth/network-request-failed' ? 'Check your internet connection and try again.' : e.message || 'Unable to send reset email.'); }
  finally { setBusy(false); }
 };
 return <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, borderBottomWidth: 1, borderColor: theme.cardBorder }}>
   <TouchableOpacity accessibilityLabel="Go back" onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
   <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>Reset Password</Text>
  </View>
  <View style={{ padding: 24, gap: 20 }}>
   <Text style={{ color: theme.textSecondary, fontSize: 16 }}>Send a secure password reset link to your account email. Your password changes only after you open the link and set a new one.</Text>
   <Text selectable style={{ color: theme.text, fontSize: 16 }}>{email}</Text>
   {!!error && <Text accessibilityRole="alert" style={{ color: '#EF4444' }}>{error}</Text>}
   {!!message && <Text accessibilityRole="alert" style={{ color: theme.text, lineHeight: 22 }}>{message}</Text>}
   <TouchableOpacity accessibilityRole="button" disabled={busy || !!secondsLeft || !email} onPress={reset} style={{ backgroundColor: theme.accent, padding: 16, borderRadius: 12, alignItems: 'center', opacity: busy || secondsLeft ? 0.6 : 1 }}>
    {busy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '700' }}>{secondsLeft ? `Try again in ${secondsLeft}s` : 'Send reset email'}</Text>}
   </TouchableOpacity>
  </View>
 </SafeAreaView>;
}
