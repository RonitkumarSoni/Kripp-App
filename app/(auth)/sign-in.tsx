import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import { Link, useRouter, Redirect } from 'expo-router';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { Ionicons } from '@expo/vector-icons';

export default function SignIn() {
    const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
    const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Google OAuth
    const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();

    // Biometric Auth
    const { authenticate, checkBiometricSupport, loading: biometricLoading } = useBiometricAuth();
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | 'iris' | 'none'>('none');

    useEffect(() => {
        const checkBiometric = async () => {
            const support = await checkBiometricSupport();
            setBiometricAvailable(support.isSupported && support.isEnrolled);
            setBiometricType(support.biometricType);
        };
        checkBiometric();
    }, []);

    // Show Google OAuth errors
    useEffect(() => {
        if (googleError) {
            setErrorMsg(googleError);
        }
    }, [googleError]);

    if (isAuthLoaded && isSignedIn) {
        return <Redirect href="/(root)/(tabs)/home" />;
    }

    const parseClerkError = (error: any): string => {
        const errObj = error?.errors?.[0];
        if (!errObj) return error?.message || "Invalid email address or password";

        const code = errObj.code;
        const msg = errObj.longMessage || errObj.message || "";

        if (code === "form_identifier_not_found" || msg.toLowerCase().includes("couldn't find") || msg.toLowerCase().includes("not found")) {
            return "Couldn't find your account with this email address. Please check your email or Sign Up.";
        }

        if (code === "form_password_incorrect" || msg.toLowerCase().includes("password")) {
            return "Incorrect password. Please try again.";
        }

        return msg || "Invalid email address or password";
    };

    const onSignInPress = async () => {
        if (!isSignInLoaded || submitting) return;
        setSubmitting(true);
        setErrorMsg("");

        if (!email.trim()) {
            setErrorMsg("Email address is required.");
            setSubmitting(false);
            return;
        }

        if (!password) {
            setErrorMsg("Password is required.");
            setSubmitting(false);
            return;
        }

        try {
            const completeSignIn = await signIn.create({
                identifier: email.trim(),
                password,
            });

            if (completeSignIn.status === 'complete' && completeSignIn.createdSessionId) {
                await setActive({ session: completeSignIn.createdSessionId });
                router.replace('/(root)/(tabs)/home');
            } else {
                console.error("SignIn status not complete:", JSON.stringify(completeSignIn, null, 2));
                setErrorMsg("Sign in incomplete. Please check your credentials.");
            }
        } catch (error: any) {
            setErrorMsg(parseClerkError(error));
        } finally {
            setSubmitting(false);
        }
    };

    const onBiometricPress = async () => {
        setErrorMsg("");
        const result = await authenticate('Sign in to Kribb');
        if (result.success) {
            // Biometric success — if user has an active session, route to home
            // Biometric only verifies device-level identity, so user must have been
            // previously signed in via Clerk for this to work
            if (isSignedIn) {
                router.replace('/(root)/(tabs)/home');
            } else {
                setErrorMsg("Please sign in with your email first, then use biometrics next time.");
            }
        } else if (result.error && result.error !== 'Authentication cancelled.') {
            setErrorMsg(result.error);
        }
    };

    const getBiometricIcon = () => {
        if (biometricType === 'facial') return 'scan-outline';
        return 'finger-print-outline';
    };

    const getBiometricLabel = () => {
        if (biometricType === 'facial') return 'Face ID';
        return 'Fingerprint';
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white" keyboardShouldPersistTaps="handled">
            <View className="flex-1 items-center justify-center">
                <View className="w-full max-w-md px-8 py-16">
                <Image
                    source={require('../../assets/images/kribb.png')}
                    style={{ width: 120, height: 48, marginBottom: 24 }}
                    resizeMode="contain"
                />

                <Text className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                    Welcome back
                </Text>
                
                <Text className="text-base text-gray-500 mb-8">
                    Sign in to your account
                </Text>

                {/* Google Sign-In Button */}
                <TouchableOpacity
                    onPress={signInWithGoogle}
                    disabled={googleLoading}
                    className="flex-row items-center justify-center bg-white border border-gray-300 rounded-lg py-3.5 mb-6"
                    style={{ opacity: googleLoading ? 0.6 : 1 }}
                >
                    {googleLoading ? (
                        <ActivityIndicator color="#4285F4" />
                    ) : (
                        <>
                            <Image
                                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                                style={{ width: 20, height: 20, marginRight: 12 }}
                            />
                            <Text className="text-gray-700 font-semibold text-base">
                                Continue with Google
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center mb-6">
                    <View className="flex-1 h-px bg-gray-200" />
                    <Text className="mx-4 text-gray-400 text-sm">or</Text>
                    <View className="flex-1 h-px bg-gray-200" />
                </View>

                <View className="mb-6">
                    <TextInput 
                        placeholder="Email Address" 
                        placeholderTextColor="#a1a1aa"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 mb-4 focus:border-gray-300 focus:outline-none" 
                        value={email}
                        onChangeText={(val) => {
                            setEmail(val);
                            if (errorMsg) setErrorMsg("");
                        }}
                    />
                    <TextInput 
                        placeholder="Password" 
                        placeholderTextColor="#a1a1aa"
                        secureTextEntry 
                        className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:border-gray-300 focus:outline-none" 
                        value={password}
                        onChangeText={(val) => {
                            setPassword(val);
                            if (errorMsg) setErrorMsg("");
                        }}
                    />
                </View>

                {errorMsg ? (
                    <Text className="text-red-500 text-sm font-medium mb-4">
                        {errorMsg}
                    </Text>
                ) : null}

                <TouchableOpacity 
                    onPress={onSignInPress} 
                    disabled={submitting}
                    className="bg-blue-600 rounded-lg py-3.5 items-center"
                >
                    {submitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-semibold text-base">Sign In</Text>
                    )}
                </TouchableOpacity>

                {/* Biometric Sign-In Button */}
                {biometricAvailable && (
                    <TouchableOpacity
                        onPress={onBiometricPress}
                        disabled={biometricLoading}
                        className="flex-row items-center justify-center bg-gray-50 border border-gray-200 rounded-lg py-3.5 mt-4"
                        style={{ opacity: biometricLoading ? 0.6 : 1 }}
                    >
                        {biometricLoading ? (
                            <ActivityIndicator color="#4B5563" />
                        ) : (
                            <>
                                <Ionicons 
                                    name={getBiometricIcon() as any} 
                                    size={22} 
                                    color="#4B5563" 
                                    style={{ marginRight: 10 }} 
                                />
                                <Text className="text-gray-700 font-semibold text-base">
                                    Sign in with {getBiometricLabel()}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-500 text-base">Don't have an account? </Text>
                    <Link href="/sign-up" asChild>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-semibold text-base">Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
                </View>
            </View>
        </ScrollView>
    );
}