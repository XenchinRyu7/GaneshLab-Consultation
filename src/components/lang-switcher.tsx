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
    <div className="flex items-center gap-1">
      {locales.map(l => {
        return (
          <Link
            key={l.code}
            href={pathname}
            locale={l.code}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              active === l.code
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            {/* Short version for mobile, full label for desktop */}
            <span className="md:hidden">{l.code.toUpperCase()}</span>
            <span className="hidden md:inline">{l.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
