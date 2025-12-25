import { type NextRequest, NextResponse } from "next/server";

import { jwtVerify } from "jose";

const secretKey = process.env.AUTH_SECRET ?? "ganeshlab_secret_key";
const key = new TextEncoder().encode(secretKey);

/**
 * Edge-compatible JWT decrypt function
 */
async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

/**
 * Runs before requests complete.
 * Use for rewrites, redirects, or header changes.
 */
export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/get-started",
    "/terms-of-service",
    "/privacy-policy",
    "/guest-appointment",
    "/guest/reschedule",
  ];

  // Remove locale prefix (en/id) from pathname for accurate route checking
  const pathnameWithoutLocale = pathname.replace(/^\/(en|id)/, "") || "/";

  const isPublicRoute =
    pathnameWithoutLocale === "/" ||
    publicRoutes.some(route => pathnameWithoutLocale.startsWith(route));

  // API routes are public but we don't redirect them
  const isApiRoute = pathname.startsWith("/api");

  // If accessing a protected route without session, redirect to login
  // Skip API routes from authentication checks
  if (!isPublicRoute && !isApiRoute && !session) {
    const url = request.nextUrl.clone();
    // Preserve locale in redirect
    const locale = pathname.split("/")[1];
    const validLocale = locale === "en" || locale === "id" ? locale : "id";
    url.pathname = `/${validLocale}/auth/login`;
    return NextResponse.redirect(url);
  }

  // If accessing login/register with valid session, redirect to dashboard
  if (
    (pathnameWithoutLocale.startsWith("/auth/login") ||
      pathnameWithoutLocale.startsWith("/auth/register")) &&
    session
  ) {
    const user = await verifySession(session);
    if (user) {
      const url = request.nextUrl.clone();
      const locale = pathname.split("/")[1];
      const validLocale = locale === "en" || locale === "id" ? locale : "id";
      url.pathname = `/${validLocale}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

/**
 * Matcher runs for specific routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
