import { NextResponse } from "next/server";

import { google } from "googleapis";

import { getBaseUrl } from "@/lib/utils";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${getBaseUrl()}/api/calendar/callback`
);

export async function GET() {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar.events"],
      prompt: "consent",
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 });
  }
}
