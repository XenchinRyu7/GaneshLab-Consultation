"use client";

import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("Common");

  return <>{t("comingSoon")}</>;
}
