import { useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

interface BiometricResult {
  success: boolean;
  error?: string;
}

interface BiometricSupport {
  isSupported: boolean;
  isEnrolled: boolean;
  biometricType: BiometricType;
}

export const useBiometricAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if the device supports biometric authentication
   * and if any biometrics are enrolled
   */
  const checkBiometricSupport = useCallback(async (): Promise<BiometricSupport> => {
    try {
      // Check hardware support
      const isSupported = await LocalAuthentication.hasHardwareAsync();
      if (!isSupported) {
        return { isSupported: false, isEnrolled: false, biometricType: 'none' };
      }

      // Check if biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return { isSupported: true, isEnrolled: false, biometricType: 'none' };
      }

      // Get the type of biometric available
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      let biometricType: BiometricType = 'none';

      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'facial';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'iris';
      }

      return { isSupported: true, isEnrolled: true, biometricType };
    } catch (err) {
      console.error('Error checking biometric support:', err);
      return { isSupported: false, isEnrolled: false, biometricType: 'none' };
    }
  }, []);

  /**
   * Authenticate user using biometrics
   */
  const authenticate = useCallback(async (
    promptMessage?: string
  ): Promise<BiometricResult> => {
    if (loading) return { success: false, error: 'Authentication already in progress' };
    setLoading(true);
    setError(null);

    try {
      const support = await checkBiometricSupport();

      if (!support.isSupported) {
        const errMsg = 'Biometric authentication is not supported on this device.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      if (!support.isEnrolled) {
        const errMsg = 'No biometrics enrolled. Please set up fingerprint or face lock in your device settings.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Sign in to Kribb',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false, // Allow PIN/pattern as fallback
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        setError(null);
        return { success: true };
      } else {
        const errMsg = result.error === 'user_cancel' 
          ? 'Authentication cancelled.' 
          : result.error === 'user_fallback'
          ? 'Fallback authentication selected.'
          : 'Authentication failed. Please try again.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      const errMsg = err?.message || 'An error occurred during authentication.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, [loading, checkBiometricSupport]);

  return {
    authenticate,
    checkBiometricSupport,
    loading,
    error,
    clearError: () => setError(null),
  };
};
