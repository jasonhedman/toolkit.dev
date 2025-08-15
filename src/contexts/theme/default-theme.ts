import type { ThemeState } from "./types";

export const DEFAULT_THEME: ThemeState = {
  currentMode: "light",
  cssVars: {
    // Global theme tokens (apply to both modes)
    theme: {
      // Typography
      "font-sans": "Space Grotesk, serif",
      "font-serif": "ui-serif, Georgia, Cambria, Times New Roman, Times, serif",
      "font-mono": "JetBrains Mono, monospace",

      // Border radius
      radius: "0.5rem",

      // Shadows
      "shadow-2xs": "0 1px 3px 0px hsl(0 0% 0% / 0.05)",
      "shadow-xs": "0 1px 3px 0px hsl(0 0% 0% / 0.05)",
      "shadow-sm":
        "0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1)",
      shadow:
        "0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1)",
      "shadow-md":
        "0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.1)",
      "shadow-lg":
        "0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 4px 6px -1px hsl(0 0% 0% / 0.1)",
      "shadow-xl":
        "0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 8px 10px -1px hsl(0 0% 0% / 0.1)",
      "shadow-2xl": "0 1px 3px 0px hsl(0 0% 0% / 0.25)",
    },

    // Light mode colors
    light: {
      background: "oklch(0.9551 0 0)",
      foreground: "oklch(0.3211 0 0)",
      card: "oklch(0.9702 0 0)",
      "card-foreground": "oklch(0.3211 0 0)",
      popover: "oklch(0.9702 0 0)",
      "popover-foreground": "oklch(0.3211 0 0)",
      primary: "#4299e1",
      "primary-foreground": "#ffffff",
      secondary: "oklch(0.9067 0 0)",
      "secondary-foreground": "oklch(0.3211 0 0)",
      muted: "oklch(0.9067 0 0)",
      "muted-foreground": "oklch(0.5103 0 0)",
      accent: "oklch(0.94 0 0)",
      "accent-foreground": "oklch(0 0 0)",
      destructive: "oklch(0.5594 0.19 25.8625)",
      "destructive-foreground": "oklch(1 0 0)",
      border: "oklch(0.8576 0 0)",
      input: "oklch(0.9067 0 0)",
      ring: "#4299e1",
      "chart-1": "oklch(0.4891 0 0)",
      "chart-2": "oklch(0.4863 0.0361 196.0278)",
      "chart-3": "oklch(0.6534 0 0)",
      "chart-4": "oklch(0.7316 0 0)",
      "chart-5": "oklch(0.8078 0 0)",
      sidebar: "oklch(0.937 0 0)",
      "sidebar-foreground": "oklch(0.3211 0 0)",
      "sidebar-primary": "oklch(0.4891 0 0)",
      "sidebar-primary-foreground": "oklch(1 0 0)",
      "sidebar-accent": "oklch(0.9067 0 0)",
      "sidebar-accent-foreground": "oklch(0.3211 0 0)",
      "sidebar-border": "oklch(0.8576 0 0)",
      "sidebar-ring": "#4299e1",
    },

    // Dark mode colors
    dark: {
      background: "oklch(0.2178 0 0)",
      foreground: "oklch(0.8853 0 0)",
      card: "oklch(0.2435 0 0)",
      "card-foreground": "oklch(0.8853 0 0)",
      popover: "oklch(0.2435 0 0)",
      "popover-foreground": "oklch(0.8853 0 0)",
      primary: "#63b3ed",
      "primary-foreground": "#0f1419",
      secondary: "oklch(0.3092 0 0)",
      "secondary-foreground": "oklch(0.8853 0 0)",
      muted: "oklch(0.285 0 0)",
      "muted-foreground": "oklch(0.5999 0 0)",
      accent: "oklch(0.32 0 0)",
      "accent-foreground": "oklch(1 0 0)",
      destructive: "oklch(0.6591 0.153 22.1703)",
      "destructive-foreground": "oklch(1 0 0)",
      border: "oklch(0.329 0 0)",
      input: "oklch(0.3092 0 0)",
      ring: "#63b3ed",
      "chart-1": "oklch(0.7058 0 0)",
      "chart-2": "oklch(0.6714 0.0339 206.3482)",
      "chart-3": "oklch(0.5452 0 0)",
      "chart-4": "oklch(0.4604 0 0)",
      "chart-5": "oklch(0.3715 0 0)",
      sidebar: "oklch(0.2393 0 0)",
      "sidebar-foreground": "oklch(0.8853 0 0)",
      "sidebar-primary": "oklch(0.7058 0 0)",
      "sidebar-primary-foreground": "oklch(0.2178 0 0)",
      "sidebar-accent": "oklch(0.275 0 0)",
      "sidebar-accent-foreground": "oklch(0.8853 0 0)",
      "sidebar-border": "oklch(0.329 0 0)",
      "sidebar-ring": "#63b3ed",
    },
  },
};
