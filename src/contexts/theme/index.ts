// Core theme functionality
export { ThemeProvider, useTheme } from "./theme-provider";
export { ThemeScript } from "./theme-script";
export { useThemeManagement } from "./use-theme-management";

// Theme utilities
export { applyThemeToElement, getPreferredColorScheme } from "./apply-theme";
export {
  fetchThemeFromUrl,
  extractThemeColors,
  THEME_URLS,
} from "./theme-utils";
export { loadThemeFromStorage, saveThemeToStorage } from "./storage";

// Default theme and types
export { DEFAULT_THEME } from "./default-theme";
export type { ThemeState, ThemePreset, ThemeContextType } from "./types";
export type { FetchedTheme } from "./theme-utils";
