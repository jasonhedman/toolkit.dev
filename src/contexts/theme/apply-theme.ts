import type { ThemeState } from "./types";

/**
 * Applies theme CSS variables to a DOM element
 * @param themeState - The theme state containing CSS variables
 * @param element - The DOM element to apply the theme to (usually document.documentElement)
 */
export function applyThemeToElement(
  themeState: ThemeState,
  element: HTMLElement = document.documentElement,
): void {
  // Apply global theme variables
  Object.entries(themeState.cssVars.theme).forEach(([key, value]) => {
    element.style.setProperty(`--${key}`, value);
  });

  // Apply mode-specific variables
  const modeVars = themeState.cssVars[themeState.currentMode];
  Object.entries(modeVars).forEach(([key, value]) => {
    element.style.setProperty(`--${key}`, value);
  });

  // Set data attribute for theme mode
  element.setAttribute("data-theme", themeState.currentMode);
  
  // Set classes for compatibility
  element.classList.toggle("light", themeState.currentMode === "light");
  element.classList.toggle("dark", themeState.currentMode === "dark");
}

/**
 * Gets the preferred color scheme from user's system
 */
export function getPreferredColorScheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  
  return window.matchMedia("(prefers-color-scheme: dark)").matches 
    ? "dark" 
    : "light";
}
