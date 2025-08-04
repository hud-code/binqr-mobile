import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark" | "system";

export interface Theme {
  colors: {
    background: string;
    surface: string;
    inputBackground: string;
    primary: string;
    primaryLight: string;
    text: string;
    textSecondary: string;
    border: string;
    card: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    shadow: string;
    overlay: string;
    placeholder: string;
    disabled: string;
  };
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    background: "#f9f9f9",
    surface: "#ffffff",
    inputBackground: "#ffffff",
    primary: "#2563eb",
    primaryLight: "#f0f9ff",
    text: "#333333",
    textSecondary: "#666666",
    border: "#e5e7eb",
    card: "#ffffff",
    success: "#16a34a",
    error: "#dc2626",
    warning: "#f59e0b",
    info: "#2563eb",
    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.5)",
    placeholder: "#999999",
    disabled: "#d1d5db",
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    background: "#0f172a",
    surface: "#1e293b",
    inputBackground: "#374151",
    primary: "#3b82f6",
    primaryLight: "#3b82f6",
    text: "#f8fafc",
    textSecondary: "#cbd5e1",
    border: "#374151",
    card: "#1e293b",
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.7)",
    placeholder: "#64748b",
    disabled: "#4b5563",
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const THEME_STORAGE_KEY = "@binqr_theme_mode";

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Load saved theme preference
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ["light", "dark", "system"].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error("Error loading theme mode:", error);
      }
    };

    loadThemeMode();
  }, []);

  // Listen for system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error("Error saving theme mode:", error);
    }
  };

  // Determine actual theme to use
  const getEffectiveTheme = (): Theme => {
    if (themeMode === "system") {
      return systemColorScheme === "dark" ? darkTheme : lightTheme;
    }
    return themeMode === "dark" ? darkTheme : lightTheme;
  };

  const theme = getEffectiveTheme();
  const isDark = theme.isDark;

  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    isDark,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Helper function to create themed styles
export function createThemedStyles<T>(styleFunction: (theme: Theme) => T) {
  return styleFunction;
}
