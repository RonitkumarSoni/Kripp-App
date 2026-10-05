import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: theme.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.cardBorder,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.sectionBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>
          Privacy Policy
        </Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Text style={{ fontSize: 13, color: theme.textMuted, marginBottom: 20 }}>
          Last updated: October 2026
        </Text>

        <Section title="1. Information We Collect" theme={theme}>
          We collect information you provide directly, such as your name, email address, and profile photo. When you list or search for properties, we collect location data and property preferences.
        </Section>

        <Section title="2. How We Use Your Information" theme={theme}>
          We use your information to provide and improve our services, personalize your experience, communicate with you about properties and updates, and ensure the security of our platform.
        </Section>

        <Section title="3. Information Sharing" theme={theme}>
          We do not sell your personal information. We may share your information with property owners when you express interest, with service providers who assist our operations, and when required by law.
        </Section>

        <Section title="4. Data Storage & Security" theme={theme}>
          Your data is stored securely using industry-standard encryption. We use Firebase and Cloudinary for data storage and media management, both of which comply with international security standards.
        </Section>

        <Section title="5. Your Rights" theme={theme}>
          You have the right to access, correct, or delete your personal information at any time. You can manage your data through the Privacy Settings page or by contacting our support team.
        </Section>

        <Section title="6. Cookies & Tracking" theme={theme}>
          We use analytics to understand how our app is used and to improve our services. You can opt out of analytics collection in the Privacy Settings.
        </Section>

        <Section title="7. Contact Us" theme={theme}>
          If you have questions about this Privacy Policy, please contact us at privacy@kribb.app.
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, theme }: { title: string; children: string; theme: any }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: theme.text, marginBottom: 6 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 22 }}>
        {children}
      </Text>
    </View>
  );
}
