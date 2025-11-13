/**
 * Company API route by user ID
 * Re-exports GET and PUT handlers
 */

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { PUT } from "./_handlers/companies-userid-route-put";

// Re-export PUT handler
export { PUT };

// GET /api/companies/[userId] - Get company by user ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;

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

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching company:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
