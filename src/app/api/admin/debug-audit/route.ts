import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalAuditLogs = await prisma.auditLog.count();

    const loginAuditLogs = await prisma.auditLog.count({
      where: {
        action: "LOGIN",
        success: true,
      },
    });

    const sampleAuditLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    const totalPics = await prisma.userProfile.count({
      where: { role: "pic" },
    });

    const picsWithProjects = await prisma.userProfile.findMany({
      where: { role: "pic" },
      select: {
        id: true,
        fullname: true,
        email: true,
        _count: {
          select: {
            projectsAsPic: true,
          },
        },
      },
      take: 5,
    });

    return NextResponse.json({
      totalAuditLogs,
      loginAuditLogs,
      sampleAuditLogs,
      totalPics,
      picsWithProjects,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
