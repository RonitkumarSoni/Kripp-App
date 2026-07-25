import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "@kribb_theme";

export const lightTheme = {
  mode: "light" as const,
  bg: "#F9FAFB",
  card: "#FFFFFF",
  cardBorder: "#F3F4F6",
  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  accent: "#2563EB",
  accentLight: "rgba(219, 234, 254, 0.5)",
  inputBg: "#FFFFFF",
  inputBorder: "#E5E7EB",
  sectionBg: "#F3F4F6",
  tabBarBg: "rgba(255,255,255,0.96)",
  tabBarBorder: "rgba(0,0,0,0.06)",
  statusBar: "dark" as const,
};

export const darkTheme = {
  mode: "dark" as const,
  bg: "#000000",
  card: "#1C1C1E",
  cardBorder: "#2C2C2E",
  text: "#F2F2F7",
  textSecondary: "#8E8E93",
  textMuted: "#636366",
  accent: "#0A84FF",
  accentLight: "rgba(10, 132, 255, 0.15)",
  inputBg: "#1C1C1E",
  inputBorder: "#3A3A3C",
  sectionBg: "#2C2C2E",
  tabBarBg: "rgba(28,28,30,0.92)",
  tabBarBorder: "rgba(255,255,255,0.08)",
  statusBar: "light" as const,
};

export type Theme = typeof lightTheme;

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val !== null) {
        setIsDark(val === "dark");
      } else {
        setIsDark(false); // Default to light theme for new users
      }
    });
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
