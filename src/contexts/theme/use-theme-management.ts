"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { useTheme } from "./theme-provider";
import {
  fetchThemeFromUrl,
  THEME_URLS,
  extractThemeColors,
  type FetchedTheme,
} from "./theme-utils";
import type { ThemePreset } from "./types";

/**
 * Hook for managing themes including fetching, applying, and custom imports
 */
export function useThemeManagement() {
  const { themeState, setThemeState, toggleMode, applyTheme, resetToDefault } =
    useTheme();
  const queryClient = useQueryClient();
  const [customThemeUrls, setCustomThemeUrls] = useState<string[]>([]);

  // Fetch built-in themes
  const {
    data: builtInThemes = [],
    isLoading: isLoadingBuiltIn,
    error: builtInError,
  } = useQuery({
    queryKey: ["themes", "built-in"],
    queryFn: async () => {
      const results = await Promise.allSettled(
        THEME_URLS.map(fetchThemeFromUrl),
      );

      return results
        .filter(
          (result): result is PromiseFulfilledResult<FetchedTheme> =>
            result.status === "fulfilled" && !result.value.error,
        )
        .map(
          (result) =>
            ({
              ...result.value.preset,
              name: result.value.name,
              isBuiltIn: true,
            }) as ThemePreset,
        );
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Fetch custom themes
  const {
    data: customThemes = [],
    isLoading: isLoadingCustom,
    error: customError,
  } = useQuery({
    queryKey: ["themes", "custom", customThemeUrls],
    queryFn: async () => {
      if (customThemeUrls.length === 0) return [];

      const results = await Promise.allSettled(
        customThemeUrls.map(fetchThemeFromUrl),
      );

      return results
        .filter(
          (result): result is PromiseFulfilledResult<FetchedTheme> =>
            result.status === "fulfilled" && !result.value.error,
        )
        .map(
          (result) =>
            ({
              ...result.value.preset,
              name: result.value.name,
              isBuiltIn: false,
            }) as ThemePreset,
        );
    },
    enabled: customThemeUrls.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes for custom themes
  });

  // Import theme mutation
  const importThemeMutation = useMutation({
    mutationFn: async (url: string) => {
      const fetchedTheme = await fetchThemeFromUrl(url);
      if (fetchedTheme.error) {
        throw new Error(fetchedTheme.error);
      }
      return { theme: fetchedTheme.preset, url, name: fetchedTheme.name };
    },
    onSuccess: ({ theme, url, name }) => {
      applyTheme(theme);

      // Add to custom themes if not already there
      if (!customThemeUrls.includes(url)) {
        setCustomThemeUrls((prev) => [...prev, url]);
      }

      // Invalidate queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ["themes"] });

      toast.success(`Applied theme: ${name}`);
    },
    onError: (error) => {
      toast.error(`Failed to import theme: ${error.message}`);
    },
  });

  // Get all themes combined
  const allThemes = [...builtInThemes, ...customThemes];
  const isLoading =
    isLoadingBuiltIn || isLoadingCustom || importThemeMutation.isPending;

  // Apply a preset theme
  const applyPreset = (preset: ThemePreset) => {
    applyTheme(preset);
    toast.success(`Applied theme: ${preset.name}`);
  };

  // Randomize theme
  const randomizeTheme = () => {
    if (allThemes.length === 0) return;

    const randomTheme = allThemes[Math.floor(Math.random() * allThemes.length)];
    if (randomTheme) {
      applyPreset(randomTheme);
    }
  };

  // Remove custom theme URL
  const removeCustomTheme = (url: string) => {
    setCustomThemeUrls((prev) => prev.filter((u) => u !== url));
    queryClient.invalidateQueries({ queryKey: ["themes", "custom"] });
    toast.success("Removed custom theme");
  };

  // Get preview colors for a theme
  const getThemePreview = (preset: ThemePreset) => {
    return extractThemeColors(preset, themeState.currentMode);
  };

  return {
    // State
    currentMode: themeState.currentMode,
    themeState,

    // Themes
    builtInThemes,
    customThemes,
    allThemes,
    isLoading,

    // Actions
    toggleMode,
    applyPreset,
    randomizeTheme,
    resetToDefault,

    // Custom theme management
    importTheme: importThemeMutation.mutate,
    isImporting: importThemeMutation.isPending,
    removeCustomTheme,
    customThemeUrls,

    // Utilities
    getThemePreview,

    // Errors
    error: builtInError || customError,
  };
}
