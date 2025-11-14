import { ReactNode } from "react";

import type { Metadata } from "next";

import { getCurrentUser } from "@/app/actions/auth";
import { Toaster } from "@/components/ui/sonner";
import { getPreference } from "@/server/server-actions";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import { ProjectStoreProvider } from "@/stores/project/project-provider";
import { UserStoreProvider } from "@/stores/user/user-provider";
import {
  THEME_MODE_VALUES,
  THEME_PRESET_VALUES,
  type ThemePreset,
  type ThemeMode,
} from "@/types/preferences/theme";

import { ThemeScript } from "./_components/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  title: "GaneshLab",
  description: "Consultation and Project Management Platform",
  icons: {
    icon: "/logo/ganeshlabs.png",
  },
};

export default async function MainLayout({ children }: Readonly<{ children: ReactNode }>) {
  const themeMode = await getPreference<ThemeMode>("theme_mode", THEME_MODE_VALUES, "light");
  const themePreset = await getPreference<ThemePreset>(
    "theme_preset",
    THEME_PRESET_VALUES,
    "default"
  );

  // Get current user from session
  const currentUser = await getCurrentUser();

  return (
    <>
      <ThemeScript themeMode={themeMode} themePreset={themePreset} />
      <PreferencesStoreProvider themeMode={themeMode} themePreset={themePreset}>
        <UserStoreProvider initialUser={currentUser}>
          <ProjectStoreProvider>
            {children}
            <Toaster />
          </ProjectStoreProvider>
        </UserStoreProvider>
      </PreferencesStoreProvider>
    </>
  );
}
