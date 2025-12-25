import { NextResponse, type NextRequest } from "next/server";

import createMiddleware from "next-intl/middleware";

import { locales, defaultLocale, localePrefix } from "./i18n.edge";

export const runtime = "nodejs"; // 🧪 TEST: Temporary untuk diagnose Edge issue

const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection: false,
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next(); // ✅ WAJIB
  }

  return handleI18nRouting(req);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
