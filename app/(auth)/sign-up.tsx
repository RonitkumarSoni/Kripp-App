import { useSignUp, useSignIn, useAuth } from '@clerk/clerk-expo';
import { Link, useRouter, Redirect } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import CustomSpinner from '../../components/CustomSpinner';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

export default function SignUp() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const { signIn } = useSignIn();
    const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Google OAuth
    const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleAuth();

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
        if (!errObj) return error?.message || "An error occurred during sign up";

        const code = errObj.code;
        const msg = errObj.longMessage || errObj.message || "";
        const param = errObj.meta?.paramName || errObj.paramName || "";

        if (code === "form_identifier_exists" || msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("taken")) {
            return "An account with this email address already exists. Please Log In.";
        }

        if (param === "email_address" || msg.toLowerCase().includes("email_address")) {
            return "Please enter a valid email address.";
        }

        if (param === "password" || msg.toLowerCase().includes("password")) {
            return "Password is invalid. Password must be at least 8 characters long.";
        }

        if (param) {
            const formattedParam = param.replace('_', ' ');
            return `${formattedParam.charAt(0).toUpperCase() + formattedParam.slice(1)} ${msg}`;
        }

        return msg || "An error occurred during sign up";
    };

    const onSignUpPress = async () => {
        if (!isLoaded || submitting) return;
        setSubmitting(true);
        setErrorMsg("");

        if (!email.trim()) {
            setErrorMsg("Email address is required.");
            setSubmitting(false);
            return;
        }

        if (!password || password.length < 8) {
            setErrorMsg("Password must be at least 8 characters long.");
            setSubmitting(false);
            return;
        }
        
        try {
            const createAttempt = await signUp.create({
                emailAddress: email.trim(),
                password,
                firstName: firstName.trim() || undefined,
                lastName: lastName.trim() || undefined,
            });
            
            if (createAttempt.status === 'complete' && createAttempt.createdSessionId) {
                await setActive({ session: createAttempt.createdSessionId });
                router.replace('/(root)/(tabs)/home');
            } else {
                await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                setPendingVerification(true);
            }
        } catch (error: any) {
            setErrorMsg(parseClerkError(error));
        } finally {
            setSubmitting(false);
        }
    };

    const onPressVerify = async () => {
        if (!isLoaded || submitting) return;
        setSubmitting(true);
        setErrorMsg("");

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

            if (completeSignUp.status === 'complete' && completeSignUp.createdSessionId) {
                await setActive({ session: completeSignUp.createdSessionId });
                router.replace('/(root)/(tabs)/home');
                return;
            } else if (completeSignUp.createdSessionId) {
                await setActive({ session: completeSignUp.createdSessionId });
                router.replace('/(root)/(tabs)/home');
                return;
            } else {
                setErrorMsg(`Verification status: ${completeSignUp.status}. Please check your code.`);
            }
        } catch (err: any) {
            const errObj = err?.errors?.[0];
            const msg = errObj?.longMessage || errObj?.message || err?.message || "";
            const errCode = errObj?.code;

            const isAlreadyVerified = 
                msg.toLowerCase().includes("already been verified") || 
                msg.toLowerCase().includes("already verified") || 
                errCode === "verification_already_verified";

            if (isAlreadyVerified) {
                if (signUp?.createdSessionId) {
                    await setActive({ session: signUp.createdSessionId });
                    router.replace('/(root)/(tabs)/home');
                    return;
                } else if (signIn && email && password) {
                    try {
                        const autoLogin = await signIn.create({ identifier: email, password });
                        if (autoLogin.createdSessionId) {
                            await setActive({ session: autoLogin.createdSessionId });
                            router.replace('/(root)/(tabs)/home');
                            return;
                        }
                    } catch (signInErr) {
                        console.error("Auto sign in failed:", signInErr);
                    }
                }
                router.replace('/sign-in');
                return;
            }

            setErrorMsg(parseClerkError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const onResendCodePress = async () => {
        if (!isLoaded) return;
        setErrorMsg("");
        try {
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setErrorMsg("A new verification code has been sent to your email.");
            setCode("");
        } catch (error: any) {
            setErrorMsg(error.errors?.[0]?.message || error.message || "Failed to resend code");
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
                <Text className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">Verify your account</Text>
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
                        <CustomSpinner size={22} color="white" />
                    ) : (
                        <Text className="text-white font-semibold text-base">Verify</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={onResendCodePress}>
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
                    Create account
                </Text>
                
                <Text className="text-base text-gray-500 mb-8">
                    Find your dream home today
                </Text>

                {/* Google Sign-Up Button */}
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
                    <View className="flex-row mb-4">
                        <View className="flex-1 pr-2">
                            <TextInput 
                                placeholder="First Name" 
                                placeholderTextColor="#a1a1aa"
                                autoCapitalize="none"
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:border-gray-300 focus:outline-none" 
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>
                        <View className="flex-1 pl-2">
                            <TextInput 
                                placeholder="Last Name" 
                                placeholderTextColor="#a1a1aa"
                                autoCapitalize="none"
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:border-gray-300 focus:outline-none" 
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </View>
                    </View>

                    <TextInput 
                        placeholder="Email Address" 
                        placeholderTextColor="#a1a1aa"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 mb-4 focus:border-gray-300 focus:outline-none" 
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput 
                        placeholder="Password" 
                        placeholderTextColor="#a1a1aa"
                        secureTextEntry 
                        className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:border-gray-300 focus:outline-none" 
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                {errorMsg ? (
                    <Text className="text-red-500 mb-4 text-sm font-medium">
                        {errorMsg}
                    </Text>
                ) : null}

                <TouchableOpacity 
                    onPress={onSignUpPress} 
                    disabled={submitting}
                    className="bg-blue-600 rounded-lg py-3.5 items-center"
                >
                    {submitting ? (
                        <CustomSpinner size={22} color="white" />
                    ) : (
                        <Text className="text-white font-semibold text-base">Sign Up</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-500 text-base">Already have an account? </Text>
                    <Link href="/sign-in" asChild>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-semibold text-base">Log In</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
                </View>
            </View>
        </ScrollView>
    );
}