import { type NextRequest, NextResponse } from "next/server";

import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/auth/register", "/get-started", "/", "/api"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If accessing a protected route without session, redirect to login
  if (!isPublicRoute && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // If accessing login/register with valid session, redirect to dashboard
  if ((pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) && session) {
    const user = await decrypt(session);
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

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

