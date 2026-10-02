import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import { MESSAGES } from '../constants/messages';

// Ensures the auth session is completed properly when redirecting back
WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Warm up browser for faster OAuth launch
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const { createdSessionId, setActive, signIn, signUp } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/home', { scheme: 'kribb' }) || 'kribb://'
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        // _layout.tsx will handle the redirect
      } else {
        // Fallback for Android APKs where redirect might be tricky but session was created
        const fallbackSessionId = signIn?.createdSessionId || signUp?.createdSessionId;
        if (fallbackSessionId && setActive) {
            console.log("Using fallback session ID from signIn/signUp object");
            await setActive({ session: fallbackSessionId });
            return;
        }
        console.warn("OAuth flow returned without a session ID.", { signIn, signUp });
        // OAuth flow was cancelled or needs additional steps
        setError(MESSAGES.AUTH.GOOGLE_OAUTH_CANCELLED);
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      let message = MESSAGES.AUTH.GOOGLE_OAUTH_ERROR;
      
      const clerkMsg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message;
      if (clerkMsg && !clerkMsg.includes('toString') && !clerkMsg.includes('undefined') && !clerkMsg.includes('null')) {
          message = clerkMsg;
      } else if (err?.message && !err.message.includes('toString') && !err.message.includes('undefined') && !err.message.includes('null')) {
          message = err.message;
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loading, startOAuthFlow, router]);

  return { signInWithGoogle, loading, error, clearError: () => setError(null) };
};
