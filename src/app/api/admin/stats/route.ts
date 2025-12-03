/* eslint-disable no-underscore-dangle */
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total users
    const totalUsers = await prisma.userProfile.count();

    // Get users created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await prisma.userProfile.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get active PICs and clients
    const activePics = await prisma.userProfile.count({
      where: {
        role: "pic",
        // Add logic for active status if you have it
      },
    });

    const activeClients = await prisma.userProfile.count({
      where: {
        role: "client",
        // Add logic for active status if you have it
      },
    });

    // Get total companies
    const totalCompanies = await prisma.company.count();

    // Get active projects
    const activeProjects = await prisma.project.count({
      where: {
        status: {
          in: ["ACTIVE", "APPROVED"],
        },
      },
    });

    // Get completed projects this month
    const completedThisMonth = await prisma.project.count({
      where: {
        status: "COMPLETED",
        updatedAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get pending approvals (projects waiting for approval)
    const pendingApprovals = await prisma.project.count({
      where: {
        status: "PENDING",
      },
    });

    // System health (placeholder - could be calculated based on uptime or error rates)
    const systemHealth = 99.8;

    // Get project status distribution for chart
    const projectStatusData = await prisma.project.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    const projectChartData = projectStatusData.map(item => ({
      name: item.status.replace("_", " "),
      value: item._count.status,
      fill:
        item.status === "COMPLETED"
          ? "#22c55e"
          : item.status === "ACTIVE"
            ? "#3b82f6"
            : item.status === "PENDING"
              ? "#f59e0b"
              : item.status === "APPROVED"
                ? "#8b5cf6"
                : "#6b7280",
    }));

    const stats = {
      totalUsers,
      activeProjects,
      systemHealth,
      activePics,
      activeClients,
      newThisMonth,
      totalCompanies,
      completedThisMonth,
      pendingApprovals,
      projectChartData,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch admin statistics" }, { status: 500 });
  }
}
