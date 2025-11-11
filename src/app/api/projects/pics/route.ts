import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/projects/pics - Get all PICs (for project creation)
export async function GET(req: NextRequest) {
  try {
    const pics = await prisma.userProfile.findMany({
      where: {
        role: "pic",
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        avatarColor: true,
      },
      orderBy: {
        fullname: "asc",
      },
    });

    return NextResponse.json({ pics }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching PICs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

