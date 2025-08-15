export interface ThemeState {
  currentMode: "light" | "dark";
  cssVars: {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

export interface ThemePreset {
  name: string;
  isBuiltIn: boolean;
  cssVars: {
    theme: Record<string, string>;
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

export interface ThemeContextType {
  themeState: ThemeState;
  setThemeState: (state: ThemeState) => void;
  currentMode: "light" | "dark";
  toggleMode: () => void;
  applyTheme: (preset: ThemePreset) => void;
  resetToDefault: () => void;
}
