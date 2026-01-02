import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/guest-appointments - Get all guest appointments
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { id: session.id },
    });

    if (userProfile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        isGuestAppointment: true,
      },
      include: {
        pic: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to match frontend expectations
    const transformedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      title: appointment.title,
      guestName: appointment.guestName ?? "",
      guestEmail: appointment.guestEmail ?? "",
      guestPhone: appointment.guestPhone ?? "",
      guestOrganization: appointment.guestOrganization ?? "",
      guestPurpose: appointment.guestPurpose ?? "",
      date: appointment.date.toISOString().split("T")[0], // YYYY-MM-DD format
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      type: appointment.type,
      status: appointment.status,
      picId: appointment.picId,
      pic: appointment.pic,
      createdAt: appointment.createdAt.toISOString(),
    }));

    return NextResponse.json({ appointments: transformedAppointments });
  } catch (error) {
    console.error("Error fetching guest appointments:", error);
    return NextResponse.json({ error: "Failed to fetch guest appointments" }, { status: 500 });
  }
}
