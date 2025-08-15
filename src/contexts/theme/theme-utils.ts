import type { ThemePreset } from "./types";

// Built-in theme URLs from tweakcn.com
export const THEME_URLS = [
  "https://tweakcn.com/themes/cmc335y45000n04ld51zg72j3",
  "https://tweakcn.com/editor/theme?theme=mono",
  "https://tweakcn.com/editor/theme?theme=t3-chat",
  "https://tweakcn.com/editor/theme?theme=tangerine",
  "https://tweakcn.com/editor/theme?theme=perpetuity",
  "https://tweakcn.com/editor/theme?theme=modern-minimal",
  "https://tweakcn.com/r/themes/vintage-paper.json",
  "https://tweakcn.com/r/themes/amethyst-haze.json",
  "https://tweakcn.com/editor/theme?theme=caffeine",
  "https://tweakcn.com/editor/theme?theme=quantum-rose",
  "https://tweakcn.com/editor/theme?theme=claymorphism",
  "https://tweakcn.com/editor/theme?theme=pastel-dreams",
  "https://tweakcn.com/editor/theme?theme=supabase",
  "https://tweakcn.com/editor/theme?theme=vercel",
  "https://tweakcn.com/editor/theme?theme=cyberpunk",
];

export type FetchedTheme = {
  name: string;
  preset: ThemePreset;
  url: string;
  error?: string;
  type: "custom" | "built-in";
};

/**
 * Converts a tweakcn editor URL to the JSON API endpoint
 */
function normalizeThemeUrl(url: string): string {
  const baseUrl = "https://tweakcn.com/r/themes/";
  const isBuiltInUrl = url.includes("editor/theme?theme=");

  return (
    url
      .replace("https://tweakcn.com/editor/theme?theme=", baseUrl)
      .replace("https://tweakcn.com/themes/", baseUrl) +
    (isBuiltInUrl ? ".json" : "")
  );
}

/**
 * Gets the theme name from the data or generates a fallback
 */
function getThemeName(themeData: any): string {
  return themeData.name
    ? themeData.name
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase())
    : "Custom Theme";
}

/**
 * Fetches a theme from a URL and converts it to ThemePreset format
 */
export async function fetchThemeFromUrl(url: string): Promise<FetchedTheme> {
  const transformedUrl = normalizeThemeUrl(url);

  try {
    const response = await fetch(transformedUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const themeData = await response.json();
    const themeName = getThemeName(themeData);
    const isBuiltIn = THEME_URLS.includes(url);

    return {
      name: themeName,
      preset: {
        name: themeName,
        isBuiltIn,
        cssVars: themeData.cssVars || { theme: {}, light: {}, dark: {} },
      },
      url,
      type: isBuiltIn ? "built-in" : "custom",
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch theme";
    const themeName = getThemeName({});
    const isBuiltIn = THEME_URLS.includes(url);

    return {
      name: themeName,
      preset: {
        name: themeName,
        isBuiltIn,
        cssVars: { theme: {}, light: {}, dark: {} },
      },
      url,
      error: errorMessage,
      type: isBuiltIn ? "built-in" : "custom",
    };
  }
}

/**
 * Extracts color swatches for theme preview
 */
export function extractThemeColors(
  preset: ThemePreset,
  mode: "light" | "dark" = "light",
): string[] {
  const { light, dark, theme } = preset.cssVars;
  const currentVars = { ...theme, ...(mode === "light" ? light : dark) };

  const colorKeys = ["primary", "accent", "secondary", "background", "muted"];
  const colors: string[] = [];

  colorKeys.forEach((key) => {
    const colorValue = currentVars[key];
    if (colorValue && colors.length < 5) {
      colors.push(
        colorValue.includes("hsl") ? `hsl(${colorValue})` : colorValue,
      );
    }
  });

  return colors;
}
