import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export async function generateMetadata() {
  const t = await getTranslations("Metadata");

  return {
    title: t("loginTitle"),
    description: t("loginDescription"),
  };
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
