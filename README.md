# Kribb - Premium Real Estate App 🏠

Kribb is a modern, high-performance real estate mobile application built with React Native (Expo) that allows users to discover, save, and list properties seamlessly. Designed with a premium iOS-style aesthetic and a dark/light theme, it delivers an exceptional user experience.

## ✨ Features

- **Auth System:** Secure authentication via Clerk.
- **Dynamic Theming:** Premium iOS-style Dark and Light modes with seamless switching.
- **Property Discovery:** Advanced search and filtering by property type, price, and bedrooms.
- **Interactive Maps:** Built-in maps for property locations.
- **Saved Properties:** Heart/bookmark your favorite properties to your saved list.
- **List Properties:** Create property listings with camera and gallery integration.
- **Real-time Notifications:** iOS-style sliding in-app notifications.
- **Haptic Feedback:** Premium tactile responses on interactions (save, tab switch, etc.).

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/) (SDK 51+)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Authentication:** [Clerk](https://clerk.com/)
- **Database / Backend:** [Supabase](https://supabase.com/)
- **Icons:** Expo Vector Icons (Ionicons)
- **Maps:** React Native Webview / OpenStreetMap

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed, and either an iOS Simulator, Android Emulator, or the Expo Go app on your physical device.

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and add your credentials:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start the Development Server
```bash
npx expo start
```
Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `i` / `a` to open in a simulator.

## 📱 Screenshots & UI

*(Add screenshots of your application here)*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
