"use client";

import { useEffect } from "react";

import { updateThemeMode, updateThemePreset } from "@/lib/theme-utils";
import type { ThemeMode, ThemePreset } from "@/types/preferences/theme";

export function ThemeScript({ themeMode, themePreset }: { themeMode: ThemeMode; themePreset: ThemePreset }) {
  useEffect(() => {
    // Set theme saat component mount (untuk menghindari flash)
    updateThemeMode(themeMode);
    updateThemePreset(themePreset);
  }, [themeMode, themePreset]);

  return null;
}
