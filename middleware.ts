import type { NextRequest } from "next/server";

import createMiddleware from "next-intl/middleware";

import { locales, defaultLocale, localePrefix } from "./i18n";

const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection: false,
});

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Early return for API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes("/favicon.ico")
  ) {
    return;
  }

  return handleI18nRouting(req);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
