"use client";

import { useTheme } from "next-themes";
import { useTheme as useCustomTheme } from "@/contexts/theme";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export const ColorModeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { currentMode, toggleMode } = useCustomTheme();

  const handleToggle = () => {
    // Toggle both next-themes and our custom theme
    setTheme(theme === "light" ? "dark" : "light");
    toggleMode();
  };

  return (
    <>
      <Button
        onClick={handleToggle}
        variant="outline"
        aria-label={`Switch to ${currentMode === "light" ? "dark" : "light"} mode`}
        size="icon"
        suppressHydrationWarning
        className="relative size-8"
      >
        <Sun className="absolute size-5 rotate-0 opacity-100 transition-all duration-300 dark:-rotate-90 dark:opacity-0" />
        <Moon className="absolute size-5 rotate-90 opacity-0 transition-all duration-300 dark:rotate-0 dark:opacity-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </>
  );
};
