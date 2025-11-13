/**
 * POST handler for /api/companies
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

import { buildCompanyData } from "./companies-route-post-build";
import { validateCompanyName, validateUserForCompany } from "./companies-route-post-validation";

/**
 * Create or update company
 */
async function createOrUpdateCompany(
  userId: string,
  companyData: Record<string, unknown>,
  existingCompany: { userId: string } | null
) {
  if (existingCompany) {
    return prisma.company.update({
      where: { userId },
      data: companyData,
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
  }

  return prisma.company.create({
    data: {
      ...companyData,
      userId,
      isVerified: false,
    } as Parameters<typeof prisma.company.create>[0]["data"],
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
}

/**
 * POST /api/companies - Create or update company
 */
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      console.error("Unauthorized: No user found in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate company name
    const nameError = validateCompanyName(body.name);
    if (nameError) return nameError;

    // Validate user
    const { user, error: userError } = await validateUserForCompany(
      sessionUser.id,
      sessionUser.email
    );
    if (userError) return userError;
    if (!user) {
      return NextResponse.json({ error: "User validation failed" }, { status: 500 });
    }

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { userId: user.id },
    });

    // Build company data
    const companyData = buildCompanyData(body);

    // Create or update company
    const company = await createOrUpdateCompany(user.id, companyData, existingCompany);

    return NextResponse.json({ company }, { status: existingCompany ? 200 : 201 });
  } catch (error) {
    console.error("Error creating/updating company:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
