import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    // Get user's projects
    const projects = await prisma.project.findMany({
      where: {
        clientId: userId,
      },
      select: {
        id: true,
        name: true,
        progress: true,
        status: true,
        pic: {
          select: {
            fullname: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === "ACTIVE").length;
    const completedProjects = projects.filter(p => p.status === "COMPLETED").length;

    // Calculate overall progress
    const overallProgress =
      projects.length > 0
        ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
        : 0;

    // Get upcoming appointments
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        clientId: userId,
        date: {
          gte: new Date(),
        },
        status: {
          in: ["confirmed", "pending"],
        },
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        title: true,
        status: true,
        pic: {
          select: {
            fullname: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
      take: 5,
    });

    // Get next appointment info
    const nextAppointment = upcomingAppointments[0];
    const nextAppointmentDate = nextAppointment
      ? new Date(nextAppointment.date).toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })
      : "None";

    // Get messages count
    const totalMessages = await prisma.message.count({
      where: {
        conversation: {
          clientId: userId,
        },
        isDeleted: false,
      },
    });

    const unreadMessages = await prisma.message.count({
      where: {
        conversation: {
          clientId: userId,
        },
        senderId: {
          not: userId, // Messages not sent by the client
        },
        readAt: null,
        isDeleted: false,
      },
    });

    const stats = {
      totalProjects,
      activeProjects,
      completedProjects,
      upcomingAppointments: upcomingAppointments.length,
      totalMessages,
      unreadMessages,
      overallProgress,
      nextAppointmentDate,
      nextAppointmentPIC: nextAppointment?.pic?.fullname ?? "",
    };

    // Format projects for frontend
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      progress: project.progress,
      status: project.status,
      picName: project.pic.fullname,
    }));

    // Format appointments for frontend
    const formattedAppointments = upcomingAppointments.map(appointment => ({
      id: appointment.id,
      date: new Date(appointment.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
      time: appointment.startTime,
      title: appointment.title,
      status: appointment.status,
      picName: appointment.pic.fullname,
    }));

    return NextResponse.json({
      stats,
      projects: formattedProjects,
      appointments: formattedAppointments,
    });
  } catch (error) {
    console.error("Error fetching client stats:", error);
    return NextResponse.json({ error: "Failed to fetch client statistics" }, { status: 500 });
  }
}
