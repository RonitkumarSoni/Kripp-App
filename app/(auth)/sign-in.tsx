import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import { Link, useRouter, Redirect } from 'expo-router';

export default function SignIn() {
    const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
    const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

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