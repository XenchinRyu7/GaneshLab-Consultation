/**
 * PUT handler for /api/companies/[userId]
 */

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { buildCompanyUpdateData } from "./companies-userid-route-put-build";

/**
 * PUT /api/companies/[userId] - Update company
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const body = await req.json();

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { userId },
    });

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Build update data
    const updateData = buildCompanyUpdateData(body);

    // Update company
    const company = await prisma.company.update({
      where: { userId },
      data: updateData,
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
  } catch (error) {
    console.error("Error updating company:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
