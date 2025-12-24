"use client";

import { useTranslations } from "next-intl";

export default function DashboardNotFound() {
  const t = useTranslations();
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-2 text-center">
      <h1 className="text-2xl font-semibold">{t("Common.pageNotFound")}</h1>
      <p className="text-muted-foreground">{t("Common.comingSoon")}</p>
    </div>
  );
}
