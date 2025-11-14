/**
 * Validation functions for POST /api/companies
 */

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * Validate user exists and is a client
 */
export async function validateUserForCompany(
  userId: string,
  userEmail: string
): Promise<{
  user: { id: string; email: string; role: string } | null;
  error: NextResponse | null;
}> {
  const user = await prisma.userProfile.findUnique({
    where: { id: userId },
  });

  if (!user) {
    // Try to find user by email as fallback
    const userByEmail = await prisma.userProfile.findUnique({
      where: { email: userEmail },
    });

    if (userByEmail) {
      return {
        user: null,
        error: NextResponse.json(
          {
            error: "User ID mismatch. Please logout and login again.",
            details: "Session user ID does not match database user ID",
          },
          { status: 401 }
        ),
      };
    }

    return {
      user: null,
      error: NextResponse.json(
        {
          error: "User not found. Please logout and login again.",
          details: `No user found with ID: ${userId} or email: ${userEmail}`,
        },
        { status: 404 }
      ),
    };
  }

  if (user.role !== "client") {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Only clients can have a company profile" },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}

/**
 * Validate company name
 */
export function validateCompanyName(name: unknown): NextResponse | null {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }
  return null;
}
