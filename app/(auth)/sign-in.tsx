import { View, Text, ScrollView, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router';

export default function SignIn() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSignInPress = async () => {
        if (!isLoaded) return;

        try {
            const completeSignIn = await signIn.create({
                identifier: email,
                password,
            });

            if (completeSignIn.status === 'complete') {
                await setActive({ session: completeSignIn.createdSessionId });
                router.replace('/(root)/(tabs)/Home');
            } else {
                console.error(JSON.stringify(completeSignIn, null, 2));
            }
        } catch (error: any) {
            alert(error.errors?.[0]?.message || error.message || "Invalid credentials");
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

                <TouchableOpacity onPress={onSignInPress} className="bg-blue-600 rounded-lg py-3.5 items-center">
                    <Text className="text-white font-semibold text-base">Sign In</Text>
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
    )
}