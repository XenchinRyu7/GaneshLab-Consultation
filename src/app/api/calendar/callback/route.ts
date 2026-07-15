import { NextRequest, NextResponse } from "next/server";

import { google } from "googleapis";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/utils";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${getBaseUrl()}/api/calendar/callback`
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/dashboard/account?error=google_auth_failed", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard/account?error=no_code", request.url));
  }

  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login?error=not_authenticated", request.url));
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(new URL("/dashboard/account?error=invalid_tokens", request.url));
    }

    // Save tokens to database
    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/account?success=calendar_connected", request.url)
    );
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(new URL("/dashboard/account?error=callback_error", request.url));
  }
}
