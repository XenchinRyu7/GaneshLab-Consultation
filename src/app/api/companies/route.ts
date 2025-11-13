/**
 * Companies API route
 * Re-exports GET and POST handlers
 */

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

import { POST } from "./_handlers/companies-route-post";

// Re-export POST handler
export { POST };

// GET /api/companies - Get company for current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.error("Unauthorized: No user found in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use current user's ID for security
    // (userId from query params is ignored for security reasons)

    // Use current user's ID for security (ignore userId param if provided)
    const userId = user.id;

    const company = await prisma.company.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ company }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
