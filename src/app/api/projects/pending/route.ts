import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "pic" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const picId = searchParams.get("picId");

    // If picId is provided, filter by that PIC, otherwise use current user
    const targetPicId = picId ?? user.id;

    const projects = await prisma.project.findMany({
      where: {
        picId: targetPicId,
        status: "PENDING",
      },
      include: {
        client: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching pending projects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
