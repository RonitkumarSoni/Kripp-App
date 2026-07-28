import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';

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
      const { createdSessionId, setActive, signIn, signUp } = await startOAuthFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/(root)/(tabs)/home');
      } else {
        // OAuth flow was cancelled or needs additional steps
        setError('Google sign-in was cancelled or requires additional verification.');
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        'Something went wrong with Google sign-in. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loading, startOAuthFlow, router]);

  return { signInWithGoogle, loading, error, clearError: () => setError(null) };
};
