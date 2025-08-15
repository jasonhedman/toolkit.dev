"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { applyThemeToElement } from "./apply-theme";
import { DEFAULT_THEME } from "./default-theme";
import { loadThemeFromStorage, saveThemeToStorage } from "./storage";
import type { ThemeState, ThemePreset, ThemeContextType } from "./types";

const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeState, setThemeStateInternal] =
    useState<ThemeState>(DEFAULT_THEME);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load theme from storage on mount
  useEffect(() => {
    const storedTheme = loadThemeFromStorage();
    setThemeStateInternal(storedTheme);
    setIsInitialized(true);
  }, []);

  // Apply theme to DOM whenever theme state changes
  useEffect(() => {
    if (isInitialized) {
      applyThemeToElement(themeState);
    }
  }, [themeState, isInitialized]);

  // Save theme to storage whenever it changes
  const setThemeState = useCallback((newState: ThemeState) => {
    setThemeStateInternal(newState);
    saveThemeToStorage(newState);
  }, []);

  const toggleMode = useCallback(() => {
    setThemeState({
      ...themeState,
      currentMode: themeState.currentMode === "light" ? "dark" : "light",
    });
  }, [themeState, setThemeState]);

  const applyTheme = useCallback(
    (preset: ThemePreset) => {
      setThemeState({
        currentMode: themeState.currentMode, // Keep current mode
        cssVars: preset.cssVars,
      });
    },
    [themeState.currentMode, setThemeState],
  );

  const resetToDefault = useCallback(() => {
    setThemeState({
      ...DEFAULT_THEME,
      currentMode: themeState.currentMode, // Keep current mode
    });
  }, [themeState.currentMode, setThemeState]);

  const value: ThemeContextType = {
    themeState,
    setThemeState,
    currentMode: themeState.currentMode,
    toggleMode,
    applyTheme,
    resetToDefault,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
