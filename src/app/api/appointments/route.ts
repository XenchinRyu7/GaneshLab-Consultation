/**
 * Appointments API route
 * Re-exports GET and POST handlers
 */

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { formatAppointment } from "./[id]/_handlers/appointments-id-route-put-format";
import { POST } from "./_handlers/appointments-route-post";

// Re-export POST handler
export { POST };

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
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
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
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
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
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      });
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Format appointments
    const formattedAppointments = appointments.map(apt => formatAppointment(apt));

    return NextResponse.json({ appointments: formattedAppointments }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
