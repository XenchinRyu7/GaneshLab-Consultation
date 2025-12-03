/* eslint-disable no-underscore-dangle */
import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "pic") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    // Get total appointments for this PIC
    const totalAppointments = await prisma.appointment.count({
      where: {
        picId: userId,
      },
    });

    // Get upcoming appointments
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        picId: userId,
        date: {
          gte: new Date(),
        },
        status: {
          in: ["confirmed", "pending"],
        },
      },
    });

    // Get completed appointments
    const completedAppointments = await prisma.appointment.count({
      where: {
        picId: userId,
        status: "completed",
      },
    });

    // Get active projects for this PIC
    const activeProjects = await prisma.project.count({
      where: {
        picId: userId,
        status: {
          in: ["ACTIVE", "APPROVED"],
        },
      },
    });

    // Get total clients for this PIC
    const totalClients = await prisma.userProfile.count({
      where: {
        role: "client",
        // You might need a relationship table to link PICs to clients
        // For now, we'll count clients that have projects with this PIC
        projectsAsClient: {
          some: {
            picId: userId,
          },
        },
      },
    });

    // Get pending requests (reschedule requests, etc.)
    const pendingRequests = await prisma.rescheduleRequest.count({
      where: {
        appointment: {
          picId: userId,
        },
        status: "pending",
      },
    });

    // Calculate available slots (count availability slots for next 30 days)
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // Get all availability slots for this PIC in the next 30 days
    const availabilities = await prisma.picAvailability.findMany({
      where: {
        picId: userId,
        date: {
          gte: now,
          lt: thirtyDaysFromNow,
        },
      },
    });

    let availableSlots = availabilities.length;

    // Subtract blocked slots
    const blockedSlots = await prisma.picBlockedSlot.count({
      where: {
        picId: userId,
        date: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
    });
    availableSlots -= blockedSlots;

    // Calculate revenue this month (sum of estimated costs from completed projects this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const revenueResult = await prisma.project.aggregate({
      _sum: {
        estimatedCost: true,
      },
      where: {
        picId: userId,
        status: "COMPLETED",
        updatedAt: {
          gte: startOfMonth,
        },
      },
    });
    const revenueThisMonth = Number((revenueResult as any)._sum?.estimatedCost ?? 0);

    const completedProjectsCount = await prisma.project.count({
      where: {
        picId: userId,
        status: "COMPLETED",
      },
    });
    const clientSatisfaction = completedProjectsCount > 0 ? 4.8 : 0; // Placeholder
    const totalReviews = completedProjectsCount;

    // Get today's appointments details
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAppointmentsDetails = await prisma.appointment.findMany({
      where: {
        picId: userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        status: true,
        client: {
          select: {
            fullname: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Get today's appointments count (for backward compatibility)
    const todaysAppointments = todaysAppointmentsDetails.length;
    const confirmedToday = todaysAppointmentsDetails.filter(a => a.status === "confirmed").length;
    const pendingToday = todaysAppointments - confirmedToday;

    // Get pending actions (projects needing approval, reschedule requests, etc.)
    const pendingProjectApprovals = await prisma.project.count({
      where: {
        picId: userId,
        status: "PENDING",
      },
    });

    const pendingRescheduleRequests = await prisma.rescheduleRequest.count({
      where: {
        appointment: {
          picId: userId,
        },
        status: "pending",
      },
    });

    // Get monthly revenue data for the last 6 months
    const revenueChartData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(date);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      const revenue = await prisma.project.aggregate({
        _sum: {
          estimatedCost: true,
        },
        where: {
          picId: userId,
          status: "COMPLETED",
          updatedAt: {
            gte: date,
            lte: endOfMonth,
          },
        },
      });

      revenueChartData.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue: Number((revenue as any)._sum?.estimatedCost ?? 0),
      });
    }

    const stats = {
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      activeProjects,
      availableSlots,
      totalClients,
      revenueThisMonth,
      pendingRequests,
      todaysAppointments,
      confirmedToday,
      pendingToday,
      clientSatisfaction,
      totalReviews,
      todaysAppointmentsDetails,
      pendingProjectApprovals,
      pendingRescheduleRequests,
      revenueChartData,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching PIC stats:", error);
    return NextResponse.json({ error: "Failed to fetch PIC statistics" }, { status: 500 });
  }
}
