import { View, Text, Button } from "react-native";
import { router } from "expo-router";

export default function Home() {
  return (
    <View>
      <Text>Home Screen</Text>

      <Button
        title="Go to Details"
        onPress={() => router.push('/details')}
      />
    </View>
  );
}