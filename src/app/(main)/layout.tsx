import { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { getCurrentUser } from "@/app/actions/auth";
import { getPreference } from "@/server/server-actions";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import { UserStoreProvider } from "@/stores/user/user-provider";
import { THEME_MODE_VALUES, THEME_PRESET_VALUES, type ThemePreset, type ThemeMode } from "@/types/preferences/theme";

import { ThemeScript } from "./_components/theme-script";
import "./globals.css";

export default async function MainLayout({ children }: Readonly<{ children: ReactNode }>) {
  const themeMode = await getPreference<ThemeMode>("theme_mode", THEME_MODE_VALUES, "light");
  const themePreset = await getPreference<ThemePreset>("theme_preset", THEME_PRESET_VALUES, "default");
  
  // Get current user from session
  const currentUser = await getCurrentUser();

  return (
    <>
      <ThemeScript themeMode={themeMode} themePreset={themePreset} />
      <PreferencesStoreProvider themeMode={themeMode} themePreset={themePreset}>
        <UserStoreProvider initialUser={currentUser}>
          {children}
          <Toaster />
        </UserStoreProvider>
      </PreferencesStoreProvider>
    </>
  );
}
