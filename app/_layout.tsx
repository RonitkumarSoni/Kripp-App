// import { ScrollView, Text, TextInput, TouchableOpacity, View,TouchableHighlight ,Platform,StatusBar} from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import "../global.css";

// const properties = [
//   {
//     id: '1', title: 'Modern Villa', city: 'Mumbai', price:
//       '₹1.2Cr'
//   },
//   {
//     id: '2', title: 'Sea View Flat', city: 'Mumbai', price:
//       '₹85L'
//   },
//   {
//     id: '3', title: 'Studio Loft', city: 'Bangalore', price:
//       '₹32L'
//   },
// ];

// export default function RootLayout() {
//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <View>
//         <Text>Hellow</Text>


//         <TextInput placeholder="search City.." placeholderTextColor="#999" style={{
//           backgroundColor: "#ddd",
//           padding: 10,
//           marginTop: 12,
//           borderWidth: 1,
//           borderColor: "#ccc",
//           borderRadius: 8,
//         }} />

//         <TouchableOpacity style={{
//           backgroundColor: "#007AFF",
//           paddingVertical: 12,
//           paddingHorizontal: 20,
//           borderRadius: 8,
//           alignItems: "center",
//           justifyContent: "center",
//           marginTop: 15,
//         }}
//           onPress={() => alert("searching")}>
//           <Text>Search</Text>
//         </TouchableOpacity>

//         <TouchableHighlight style={{
//           backgroundColor: "#666",
//           paddingVertical: 12,
//           paddingHorizontal: 20,
//           borderRadius: 8,
//           alignItems: "center",
//           justifyContent: "center",
//           marginTop: 15,
//         }}
//           onPress={() => alert("searching")}>
//           <Text>Highlight</Text>
//         </TouchableHighlight>

//       </View>

//       <StatusBar hidden={true} backgroundColor="#007AFF" barStyle="light-content"/> <Text>Platform: {Platform.OS}</Text>
//       <ScrollView>
//         {properties.map((item) => (
//           <View key={item.id}>
//             <Text>{item.title}</Text>
//             <Text>{item.city}</Text>
//             <Text>{item.price}</Text>
//           </View>
//         ))}
//       </ScrollView>

//       {/* <FlatList data={properties} keyExtractor={(item) => item.id} 
//       renderItem={({item})=>(
//         <View>
//           <Text>{item.title}</Text>
//           <Text>{item.city}</Text>
//           <Text>{item.price}</Text>
//         </View>
//       )}
//       /> */}

//     </SafeAreaView>
//   );
// }


import { Stack } from "expo-router";
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import "../global.css";

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log('No values stored under key: ' + key);
      }
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <Stack screenOptions={{ headerShown: false }} />
      </ClerkLoaded>
    </ClerkProvider>
  );
}