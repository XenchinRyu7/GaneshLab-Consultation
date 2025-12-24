import { NextRequest } from "next/server";

import createMiddleware from "next-intl/middleware";

import { locales, defaultLocale, localePrefix } from "./i18n";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection: false,
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for:
  // - /api/* (direct API routes)
  // - /:locale/api/* (localized paths to API - shouldn't happen but just in case)
  // - /_next/* (Next.js internals)
  // - Static files (contains dot)
  const shouldSkip =
    pathname.startsWith("/api") ||
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    pathname.match(/^\/[^/]+\/api/) || // matches /id/api, /en/api, etc
    pathname.startsWith("/_next") ||
    pathname.includes(".");

  if (shouldSkip) {
    return;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|api).*)"],
};
