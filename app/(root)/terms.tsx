import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function TermsOfServiceScreen() {
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
          Terms of Service
        </Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Text style={{ fontSize: 13, color: theme.textMuted, marginBottom: 20 }}>
          Last updated: October 2026
        </Text>

        <Section title="1. Acceptance of Terms" theme={theme}>
          By accessing and using the Kribb application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
        </Section>

        <Section title="2. Description of Service" theme={theme}>
          Kribb is a real estate marketplace platform that connects property buyers, sellers, and renters. We provide tools for listing, searching, and managing properties.
        </Section>

        <Section title="3. User Accounts" theme={theme}>
          You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
        </Section>

        <Section title="4. Property Listings" theme={theme}>
          Users who list properties must provide accurate and truthful information. Kribb reserves the right to remove any listing that violates our policies or contains misleading information.
        </Section>

        <Section title="5. User Conduct" theme={theme}>
          You agree not to use the platform for any unlawful purpose, to harass other users, to post false information, or to attempt to gain unauthorized access to our systems.
        </Section>

        <Section title="6. Intellectual Property" theme={theme}>
          All content, branding, and technology within Kribb are the property of Kribb and its licensors. You may not reproduce, distribute, or create derivative works without written permission.
        </Section>

        <Section title="7. Limitation of Liability" theme={theme}>
          Kribb is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.
        </Section>

        <Section title="8. Contact" theme={theme}>
          For questions about these Terms, please contact us at support@kribb.app.
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
