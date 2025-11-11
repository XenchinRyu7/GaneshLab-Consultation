import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/appointments - Get all appointments for the current user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role"); // "client" | "pic" | "admin"

    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and role are required" }, { status: 400 });
    }

    let appointments;
    if (role === "client") {
      appointments = await prisma.appointment.findMany({
        where: {
          clientId: userId,
        },
        include: {
          client: {
            select: {
              id: true,
              fullname: true,
              email: true,
            },
          },
          pic: {
            select: {
              id: true,
              fullname: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { date: "asc" },
          { startTime: "asc" },
        ],
      });
    } else if (role === "pic") {
      appointments = await prisma.appointment.findMany({
        where: {
          picId: userId,
        },
        include: {
          client: {
            select: {
              id: true,
              fullname: true,
              email: true,
            },
          },
          pic: {
            select: {
              id: true,
              fullname: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { date: "asc" },
          { startTime: "asc" },
        ],
      });
    } else if (role === "admin") {
      // Admin can see all appointments
      appointments = await prisma.appointment.findMany({
        include: {
          client: {
            select: {
              id: true,
              fullname: true,
              email: true,
            },
          },
          pic: {
            select: {
              id: true,
              fullname: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { date: "asc" },
          { startTime: "asc" },
        ],
      });
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Format appointments
    const formattedAppointments = appointments.map((apt) => ({
      id: apt.id,
      title: apt.title,
      description: apt.description,
      clientId: apt.clientId,
      clientName: apt.client.fullname,
      picId: apt.picId,
      pmId: apt.picId, // Alias for compatibility
      pmName: apt.pic.fullname,
      picName: apt.pic.fullname,
      projectId: apt.projectId,
      projectName: apt.project?.name,
      date: apt.date.toISOString().split("T")[0],
      startTime: apt.startTime,
      endTime: apt.endTime,
      duration: apt.duration,
      type: apt.type,
      meetingLink: apt.meetingLink,
      location: apt.location,
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.createdAt.toISOString(),
      updatedAt: apt.updatedAt.toISOString(),
    }));

    return NextResponse.json({ appointments: formattedAppointments }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      clientId,
      picId,
      projectId,
      date,
      startTime,
      endTime,
      duration,
      type,
      meetingLink,
      location,
    } = body;

    // Validate required fields
    if (!title || !clientId || !picId || !date || !startTime || !endTime || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate duration
    if (!duration || duration <= 0) {
      return NextResponse.json({ error: "Duration must be greater than 0" }, { status: 400 });
    }

    // Check if PIC is available at this time
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        picId,
        date: new Date(date),
        status: {
          not: "cancelled",
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "PIC is not available at this time. Another appointment exists." },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        title,
        description,
        clientId,
        picId,
        projectId: projectId || null,
        date: new Date(date),
        startTime,
        endTime,
        duration,
        type,
        meetingLink: type === "online" ? meetingLink : null,
        location: type === "offline" ? location : null,
        status: "pending",
      },
      include: {
        client: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        pic: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Format appointment
    const formattedAppointment = {
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      clientId: appointment.clientId,
      clientName: appointment.client.fullname,
      picId: appointment.picId,
      pmId: appointment.picId,
      pmName: appointment.pic.fullname,
      picName: appointment.pic.fullname,
      projectId: appointment.projectId,
      projectName: appointment.project?.name,
      date: appointment.date.toISOString().split("T")[0],
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      duration: appointment.duration,
      type: appointment.type,
      meetingLink: appointment.meetingLink,
      location: appointment.location,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };

    return NextResponse.json({ appointment: formattedAppointment }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

