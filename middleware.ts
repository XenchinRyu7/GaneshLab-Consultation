import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale, localePrefix } from "./i18n";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection: false,
});

// Match only routes that should be internationalized
export const config = {
  matcher: [
    // Match all pathnames except those starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
