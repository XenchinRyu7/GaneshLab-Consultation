"use client";

import { FileQuestion } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-md space-y-6 px-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
          <FileQuestion className="h-10 w-10 text-zinc-600 dark:text-zinc-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            404
          </h1>
          <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">{t("title")}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("description")}</p>
        </div>

        <Button
          asChild
          size="lg"
          className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Link href="/dashboard/overview">{t("backButton")}</Link>
        </Button>
      </div>
    </div>
  );
}
