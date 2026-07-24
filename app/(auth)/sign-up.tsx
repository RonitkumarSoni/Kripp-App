import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUp() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [errors, setErrors] = useState<any>({ fields: {} });

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        
        try {
            await signUp.create({
                emailAddress: email,
                password,
                firstName,
                lastName,
            });
            
            if (signUp.status === 'complete') {
                // If Clerk settings don't require email verification, we are done
                await setActive({ session: signUp.createdSessionId });
                router.replace('/(root)/(tabs)/Home');
            } else {
                // Otherwise, prepare email verification and show the Verify UI
                await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                setPendingVerification(true);
            }
        } catch (error: any) {
            alert(error.errors?.[0]?.message || error.message || "An error occurred");
        }
    };

    const onPressVerify = async () => {
        if (!isLoaded) return;

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                router.replace('/(root)/(tabs)/Home');
            } else {
                console.error(JSON.stringify(completeSignUp, null, 2));
            }
        } catch (err: any) {
            const message = Array.isArray(err?.errors) && err.errors[0]?.message
                ? err.errors[0].message
                : "Invalid code";
            setErrors({ fields: { code: { message } } });
        }
    };

    const onResendCodePress = async () => {
        if (!isLoaded) return;
        try {
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            Alert.alert("Code Sent", "A new verification code has been sent to your email.");
            setErrors({ fields: {} });
            setCode("");
        } catch (error: any) {
            Alert.alert("Error", error.errors?.[0]?.message || error.message || "Failed to resend code");
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
                <Text className="text-gray-500 mb-6">We sent a code to</Text>
                
                <TextInput
                    value={code}
                    placeholder="Enter verification code"
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 mb-2 focus:border-gray-300 focus:outline-none"
                    onChangeText={(val) => {
                        setCode(val);
                        if (errors.fields?.code) setErrors({ fields: {} });
                    }}
                    keyboardType="number-pad"
                />

                {errors.fields?.code && (
                    <Text className="text-red-500 mb-4 text-sm">
                        {errors.fields.code.message}
                    </Text>
                )}
                
                <TouchableOpacity onPress={onPressVerify} className="bg-blue-600 rounded-lg py-3.5 items-center mb-4 mt-4">
                    <Text className="text-white font-semibold text-base">Verify</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onResendCodePress}>
                    <Text className="text-blue-600 text-sm">I need a new code</Text>
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

                <TouchableOpacity onPress={onSignUpPress} className="bg-blue-600 rounded-lg py-3.5 items-center">
                    <Text className="text-white font-semibold text-base">Sign Up</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-500 text-base">Already have an account? </Text>
                    <Link href="/sign-in" asChild>
                        <TouchableOpacity>
                            <Text className="text-blue-600 font-semibold text-base">Sign In</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
                <View nativeID='Clerk-captcha'/>
                </View>
            </View>
        </ScrollView>
    )
}