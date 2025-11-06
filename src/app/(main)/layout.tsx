import { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { getPreference } from "@/server/server-actions";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import { THEME_MODE_VALUES, THEME_PRESET_VALUES, type ThemePreset, type ThemeMode } from "@/types/preferences/theme";

import { ThemeScript } from "./_components/theme-script";
import "./globals.css";

export default async function MainLayout({ children }: Readonly<{ children: ReactNode }>) {
  const themeMode = await getPreference<ThemeMode>("theme_mode", THEME_MODE_VALUES, "light");
  const themePreset = await getPreference<ThemePreset>("theme_preset", THEME_PRESET_VALUES, "default");

  return (
    <>
      <ThemeScript themeMode={themeMode} themePreset={themePreset} />
      <PreferencesStoreProvider themeMode={themeMode} themePreset={themePreset}>
        {children}
        <Toaster />
      </PreferencesStoreProvider>
    </>
  );
}
