/* eslint-disable no-underscore-dangle */
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") ?? "30d"; // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // User statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [totalUsers, newUsers, activeUsers] = await Promise.all([
      prisma.userProfile.count(),
      prisma.userProfile.count({
        where: { createdAt: { gte: startDate } },
      }),
      // Active users are those who logged in within the last 24 hours
      prisma.auditLog
        .findMany({
          where: {
            action: "LOGIN",
            success: true,
            createdAt: { gte: yesterday },
          },
          distinct: ["userId"],
          select: { userId: true },
        })
        .then(logs => logs.length),
    ]);

    // Project statistics
    const [totalProjects, newProjects, completedProjects] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.project.count({
        where: {
          status: "COMPLETED",
          updatedAt: { gte: startDate },
        },
      }),
    ]);

    // Appointment statistics
    const [totalAppointments, completedAppointments] = await Promise.all([
      prisma.appointment.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.appointment.count({
        where: {
          status: "completed",
          updatedAt: { gte: startDate },
        },
      }),
    ]);

    const userActivityData = await prisma.$queryRaw<Array<{ date: Date; active_users: number }>>`
        SELECT
          created_at::date as date,
          COUNT(DISTINCT user_id)::int as active_users
        FROM audit_logs
        WHERE action = 'LOGIN'
          AND success = true
          AND user_id IS NOT NULL
        GROUP BY created_at::date
        ORDER BY date DESC
        LIMIT 30
      `;

    const recentLogins = await prisma.auditLog.findMany({
      where: {
        action: "LOGIN",
        success: true,
      },
      include: {
        user: {
          select: {
            fullname: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Project status distribution
    const projectStatusData = await prisma.project.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const activeCompletedCount = await prisma.project.count({
      where: {
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
    });

    // If no ACTIVE/COMPLETED, get all projects instead
    const topPicsData = await prisma.project.groupBy({
      by: ["picId"],
      _count: {
        id: true,
      },
      where:
        activeCompletedCount > 0
          ? {
              status: { in: ["ACTIVE", "COMPLETED"] },
            }
          : undefined,
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    const picIds = topPicsData.map(item => item.picId);
    const picProfiles = await prisma.userProfile.findMany({
      where: {
        id: { in: picIds },
      },
      select: {
        id: true,
        fullname: true,
        email: true,
      },
    });

    const topPics = topPicsData.map(item => {
      const profile = picProfiles.find(p => p.id === item.picId);
      return {
        id: item.picId,
        fullname: profile?.fullname ?? "Unknown",
        email: profile?.email ?? "unknown@email.com",
        _count: {
          projectsAsPic: item._count.id,
        },
      };
    });

    const recentActivities = await prisma.auditLog.findMany({
      take: 10,
      include: {
        user: {
          select: {
            fullname: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const response = {
      overview: {
        totalUsers,
        newUsers,
        activeUsers,
        totalProjects,
        newProjects,
        completedProjects,
        totalAppointments,
        completedAppointments,
      },
      charts: {
        userActivity: userActivityData,
        projectStatus: projectStatusData,
      },
      topPics,
      recentActivities,
      recentLogins,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
