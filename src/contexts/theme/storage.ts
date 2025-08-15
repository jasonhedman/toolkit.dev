import type { ThemeState } from "./types";
import { DEFAULT_THEME } from "./default-theme";
import { getPreferredColorScheme } from "./apply-theme";

const THEME_STORAGE_KEY = "toolkit-theme-state";

/**
 * Loads theme state from localStorage
 */
export function loadThemeFromStorage(): ThemeState {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (!stored) {
      // If no theme is stored, use default with system preference
      return {
        ...DEFAULT_THEME,
        currentMode: getPreferredColorScheme(),
      };
    }

    const parsed = JSON.parse(stored) as ThemeState;
    
    // Validate the structure
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.currentMode &&
      parsed.cssVars &&
      parsed.cssVars.theme &&
      parsed.cssVars.light &&
      parsed.cssVars.dark
    ) {
      return parsed;
    }
    
    // If invalid, return default
    return {
      ...DEFAULT_THEME,
      currentMode: getPreferredColorScheme(),
    };
  } catch (error) {
    console.warn("Failed to load theme from storage:", error);
    return {
      ...DEFAULT_THEME,
      currentMode: getPreferredColorScheme(),
    };
  }
}

/**
 * Saves theme state to localStorage
 */
export function saveThemeToStorage(themeState: ThemeState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeState));
  } catch (error) {
    console.warn("Failed to save theme to storage:", error);
  }
}
