import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import { Link, useRouter, Redirect } from 'expo-router';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { Ionicons } from '@expo/vector-icons';
import { MESSAGES } from '../../constants/messages';
import { clerkErrorMessage } from '../../lib/clerk-errors';
import type { SignInResource } from '@clerk/types';

export default function SignIn() {
    const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
    const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [verificationFactor, setVerificationFactor] = useState<'first' | 'second'>('first');
    const [successMsg, setSuccessMsg] = useState('');

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

    // Redirect handled by _layout.tsx based on auth state
    // if (isAuthLoaded && isSignedIn) {
    //     return <Redirect href="/(root)/(tabs)/home" />;
    // }

    const parseClerkError = (error: any): string => {
        const errObj = error?.errors?.[0];
        if (!errObj) {
            console.error("Auth error:", error);
            return clerkErrorMessage(error, MESSAGES.AUTH.SIGN_IN_ERROR);
        }

        const code = errObj.code;
        const msg = errObj.longMessage || errObj.message || "";

        if (code === "form_identifier_not_found" || msg.toLowerCase().includes("couldn't find") || msg.toLowerCase().includes("not found")) {
            return MESSAGES.AUTH.ACCOUNT_NOT_FOUND;
        }

        if (code === "form_password_incorrect") {
            return MESSAGES.AUTH.INCORRECT_PASSWORD;
        }

        if (msg.includes('toString') || msg.includes('undefined') || msg.includes('null')) {
            return MESSAGES.GENERAL?.ERROR || "An unexpected error occurred. Please try again.";
        }

        return msg || MESSAGES.AUTH.SIGN_IN_ERROR;
    };

    const continueSignIn = async (attempt: SignInResource) => {
        if (attempt.status === 'complete' && attempt.createdSessionId) {
            await setActive!({ session: attempt.createdSessionId });
            return;
        }
        if (attempt.status === 'needs_first_factor') {
            const factor = attempt.supportedFirstFactors?.find(f => f.strategy === 'email_code');
            if (!factor || factor.strategy !== 'email_code') {
                throw new Error('Email verification is unavailable for this account. Please use another sign-in method.');
            }
            await attempt.prepareFirstFactor({ strategy: 'email_code', emailAddressId: factor.emailAddressId });
            setVerificationFactor('first');
        } else if (String(attempt.status) === 'needs_client_trust' || attempt.status === 'needs_second_factor') {
            const factor = attempt.supportedSecondFactors?.find(f => f.strategy === 'email_code');
            if (!factor || factor.strategy !== 'email_code') {
                throw new Error('This account requires a different verification method. Email verification is not available.');
            }
            await attempt.prepareSecondFactor({ strategy: 'email_code', emailAddressId: factor.emailAddressId });
            setVerificationFactor('second');
        } else {
            throw new Error(MESSAGES.AUTH.SIGN_IN_INCOMPLETE);
        }
        setCode('');
        setPendingVerification(true);
    };

    const onResendCodePress = async () => {
        if (!isSignInLoaded || submitting) return;
        setSubmitting(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            await continueSignIn(signIn);
            setSuccessMsg('A new code was requested. Please check your inbox and spam folder.');
        } catch (error) {
            setErrorMsg(clerkErrorMessage(error, 'Unable to resend the code.'));
        } finally {
            setSubmitting(false);
        }
    };

    const onSignInPress = async () => {
        if (!isSignInLoaded || submitting) return;
        setSubmitting(true);
        setErrorMsg("");

        if (!email || !email.trim()) {
            setErrorMsg(MESSAGES.AUTH.EMAIL_REQUIRED);
            setSubmitting(false);
            return;
        }

        if (!password) {
            setErrorMsg(MESSAGES.AUTH.PASSWORD_REQUIRED);
            setSubmitting(false);
            return;
        }

        try {
            const completeSignIn = await signIn.create({
                identifier: String(email).trim(),
                password: String(password),
            });

            await continueSignIn(completeSignIn);
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
                // _layout.tsx handles redirect
            } else {
                setErrorMsg(MESSAGES.AUTH.BIOMETRIC_SIGN_IN_FIRST);
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

    const onPressVerify = async () => {
        if (!isSignInLoaded || submitting) return;
        setSubmitting(true);
        setErrorMsg("");

        try {
            setSuccessMsg('');
            const completeSignIn = verificationFactor === 'second'
                ? await signIn.attemptSecondFactor({ strategy: 'email_code', code: code.trim() })
                : await signIn.attemptFirstFactor({ strategy: 'email_code', code: code.trim() });
            await continueSignIn(completeSignIn);
        } catch (err: any) {
            setErrorMsg(parseClerkError(err));
        } finally {
            setSubmitting(false);
        }
    };

    if (pendingVerification) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <View className="w-full max-w-md px-8 py-16">
                <Image
                    source={require('../../assets/images/kribb.png')}
                    style={{ width: 120, height: 48, marginBottom: 24 }}
                    resizeMode="contain"
                />
                <Text className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">Verify your login</Text>
                <Text className="text-gray-500 mb-6">We sent a verification code to {email}</Text>
                
                <TextInput
                    value={code}
                    placeholder="Enter verification code"
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 mb-4 focus:border-gray-300 focus:outline-none"
                    onChangeText={(val) => {
                        setCode(val);
                        if (errorMsg) setErrorMsg("");
                    }}
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                />

                {errorMsg ? (
                    <Text className="text-red-500 mb-4 text-sm font-medium">
                        {errorMsg}
                    </Text>
                ) : null}
                
                <TouchableOpacity 
                    onPress={onPressVerify} 
                    disabled={submitting}
                    className="bg-blue-600 rounded-lg py-3.5 items-center mb-4 mt-2"
                >
                    {submitting ? (
                        <ActivityIndicator size={22} color="white" />
                    ) : (
                        <Text className="text-white font-semibold text-base">Verify & Log In</Text>
                    )}
                </TouchableOpacity>
                {successMsg ? <Text className="text-green-600 mb-4 text-sm">{successMsg}</Text> : null}
                <TouchableOpacity onPress={onResendCodePress} disabled={submitting}>
                    <Text className="text-blue-600 text-sm font-medium">I need a new code</Text>
                </TouchableOpacity>
                </View>
            </View>
        );
    }

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
                    <View className="w-full bg-white border border-gray-300 rounded-lg mb-4 focus-within:border-gray-400">
                        <TextInput 
                            placeholder="Email Address" 
                            placeholderTextColor="#a1a1aa"
                            value={email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onChangeText={(val) => {
                                setEmail(val);
                                if (errorMsg) setErrorMsg("");
                            }}
                            className="w-full px-4 py-3 text-sm text-gray-900 bg-transparent focus:outline-none"
                        />
                    </View>

                    <View className="w-full bg-white border border-gray-300 rounded-lg mb-2 focus-within:border-gray-400">
                        <TextInput 
                            placeholder="Password" 
                            placeholderTextColor="#a1a1aa"
                            value={password}
                            secureTextEntry
                            onChangeText={(val) => {
                                setPassword(val);
                                if (errorMsg) setErrorMsg("");
                            }}
                            className="w-full px-4 py-3 text-sm text-gray-900 bg-transparent focus:outline-none"
                        />
                    </View>
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
                    <Link href="/sign-up" replace asChild>
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
