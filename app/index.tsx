import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function Index() {
  const {isSignedIn, isLoaded} = useAuth();

  if(!isLoaded) return null;

  // redirect based on auth state
  if(isSignedIn) return <Redirect href="/Home" />
  
  return <Redirect href="/sign-up" />;
}
