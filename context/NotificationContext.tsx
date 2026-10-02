import React, { createContext, useContext, useState, useRef } from "react";
import { Animated, Text, View, StyleSheet, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NotificationType = "info" | "success" | "warning" | "error";

interface NotificationConfig {
  title: string;
  body: string;
  type?: NotificationType;
}

interface NotificationContextType {
  showNotification: (config: NotificationConfig) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useInAppNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useInAppNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<NotificationConfig>({
    title: "",
    body: "",
    type: "info",
  });

  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-150)).current;

  const showNotification = ({ title, body, type = "info" }: NotificationConfig) => {
    setConfig({ title, body, type });
    setVisible(true);

    // Slide Down
    Animated.spring(slideAnim, {
      toValue: Platform.OS === "ios" ? insets.top + 10 : 20,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();

    // Auto Hide after 3.5 seconds
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
      });
    }, 3500);
  };

    const getIcon = (type?: NotificationType) => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#10B981" };
      case "warning":
        return { name: "alert-circle", color: "#F59E0B" };
      case "error":
        return { name: "close-circle", color: "#EF4444" };
      default:
        return { name: "notifications", color: "#2563EB" };
    }
  };

  const icon = getIcon(config.type);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.banner,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.content}>
            <View style={[styles.iconBg, { backgroundColor: `${icon.color}15` }]}>
              <Ionicons name={icon.name as any} size={20} color={icon.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {config.title}
              </Text>
              <Text style={styles.body} numberOfLines={2}>
                {config.body}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

const { width } = Dimensions.get("window");
const bannerWidth = Platform.OS === "web" ? 380 : width - 32;

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: Platform.OS === "web" ? "50%" : 16,
    marginLeft: Platform.OS === "web" ? -190 : 0,
    width: bannerWidth,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 20,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
    zIndex: 9999,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.06)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  body: {
    fontSize: 11,
    color: "#4B5563",
    lineHeight: 15,
  },
});
