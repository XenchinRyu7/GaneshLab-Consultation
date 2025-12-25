import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

import { locales, defaultLocale, localePrefix } from "../../i18n.edge";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
