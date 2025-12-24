"use client";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

const locales = [
  { code: "id", label: "Indonesia" },
  { code: "en", label: "English" },
] as const;

export function LangSwitcher() {
  const active = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      {locales.map(l => {
        return (
          <Link
            key={l.code}
            href={pathname}
            locale={l.code}
            className={`rounded px-2 py-1 text-xs ${active === l.code ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
