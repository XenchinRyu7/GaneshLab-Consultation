import { NextResponse, type NextRequest } from "next/server";

import createMiddleware from "next-intl/middleware";

import { locales, defaultLocale, localePrefix } from "./i18n.edge";
import { proxy } from "./src/proxy";

export const runtime = "nodejs";

const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection: false,
});

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next();
  }

  // 1. First, check authentication via proxy
  const authResponse = await proxy(req);
  if (authResponse.status === 307 || authResponse.status === 308) {
    // Redirect response from proxy (auth check)
    return authResponse;
  }

  // 2. Then, handle i18n routing
  return handleI18nRouting(req);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
