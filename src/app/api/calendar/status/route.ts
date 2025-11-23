import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      // Fallback to current user if no userId provided
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      const userProfile = await prisma.userProfile.findUnique({
        where: { id: user.id },
        select: {
          googleAccessToken: true,
          googleTokenExpiry: true,
        },
      });

      const connected = !!(userProfile?.googleAccessToken && userProfile?.googleTokenExpiry);
      return NextResponse.json({ connected });
    }

    // Check status for specific user (PIC)
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleTokenExpiry: true,
      },
    });

    const connected = !!(userProfile?.googleAccessToken && userProfile?.googleTokenExpiry);
    return NextResponse.json({ connected });
  } catch (error) {
    console.error("Error checking calendar status:", error);
    return NextResponse.json({ error: "Failed to check calendar status" }, { status: 500 });
  }
}
