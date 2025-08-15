"use client";

import { applyThemeToElement, getPreferredColorScheme } from "./apply-theme";
import { DEFAULT_THEME } from "./default-theme";
import type { ThemeState } from "./types";

/**
 * Inline script component that runs before React hydration to prevent theme flash.
 * This reads the stored theme from localStorage and applies it immediately.
 */
export function ThemeScript() {
  const themeScript = `
(function() {
  try {
    var THEME_STORAGE_KEY = "toolkit-theme-state";
    var stored = localStorage.getItem(THEME_STORAGE_KEY);
    var themeState;
    
    if (stored) {
      try {
        themeState = JSON.parse(stored);
      } catch (e) {
        themeState = null;
      }
    }
    
    // If no valid stored theme, use default with system preference
    if (!themeState || !themeState.currentMode || !themeState.cssVars) {
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      themeState = {
        currentMode: prefersDark ? "dark" : "light",
        cssVars: ${JSON.stringify(DEFAULT_THEME.cssVars)}
      };
    }
    
    // Apply theme variables immediately with !important to override CSS defaults
    var element = document.documentElement;
    
    // Apply global theme variables
    Object.entries(themeState.cssVars.theme || {}).forEach(function(entry) {
      element.style.setProperty("--" + entry[0], entry[1], "important");
    });
    
    // Apply mode-specific variables
    var modeVars = themeState.cssVars[themeState.currentMode] || {};
    Object.entries(modeVars).forEach(function(entry) {
      element.style.setProperty("--" + entry[0], entry[1], "important");
    });
    
    // Set data attribute and classes
    element.setAttribute("data-theme", themeState.currentMode);
    element.classList.toggle("light", themeState.currentMode === "light");
    element.classList.toggle("dark", themeState.currentMode === "dark");
  } catch (error) {
    console.warn("Theme script error:", error);
  }
})();
`;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: themeScript,
      }}
    />
  );
}
