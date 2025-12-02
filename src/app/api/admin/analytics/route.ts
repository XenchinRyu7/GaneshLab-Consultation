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

    // Revenue statistics
    const revenueData = await prisma.project.aggregate({
      where: {
        status: { in: ["COMPLETED", "ACTIVE", "ON_MAINTAIN"] },
        estimatedCost: { not: null },
      },
      _sum: { estimatedCost: true },
    });

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

    // User activity trends (last 30 days) - count unique users who logged in each day
    const userActivityData = await prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(DISTINCT user_id) as active_users
      FROM audit_logs
      WHERE created_at >= ${startDate}
        AND action = 'LOGIN'
        AND success = true
        AND user_id IS NOT NULL
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // Project status distribution
    const projectStatusData = await prisma.project.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    // Revenue by month (last 12 months)
    const revenueByMonth = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', created_at) as month,
        SUM(estimated_cost) as revenue
      FROM projects
      WHERE status IN ('COMPLETED', 'ACTIVE', 'ON_MAINTAIN')
        AND estimated_cost IS NOT NULL
        AND created_at >= ${new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;

    // Top PICs by project count
    const topPics = await prisma.userProfile.findMany({
      where: { role: "pic" },
      select: {
        id: true,
        fullname: true,
        email: true,
        _count: {
          select: {
            projectsAsPic: {
              where: { status: { in: ["ACTIVE", "COMPLETED"] } },
            },
          },
        },
      },
      orderBy: {
        projectsAsPic: {
          _count: "desc",
        },
      },
      take: 10,
    });

    // Recent audit logs summary
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

    return NextResponse.json({
      overview: {
        totalUsers,
        newUsers,
        activeUsers,
        totalProjects,
        newProjects,
        completedProjects,
        totalRevenue: revenueData._sum.estimatedCost ?? 0,
        totalAppointments,
        completedAppointments,
      },
      charts: {
        userActivity: userActivityData,
        projectStatus: projectStatusData,
        revenueByMonth,
      },
      topPics,
      recentActivities,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
