/**
 * Appointment API route by ID
 * Re-exports GET, PUT, and DELETE handlers
 */

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { logAudit, getRequestInfo } from "@/lib/audit-logger";
import { prisma } from "@/lib/prisma";

import { PUT } from "./_handlers/appointments-id-route-put";
import { formatAppointment } from "./_handlers/appointments-id-route-put-format";

// Re-export PUT handler
export { PUT };

// GET /api/appointments/[id] - Get a single appointment
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
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

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Format appointment
    const formattedAppointment = formatAppointment(appointment);

    return NextResponse.json({ appointment: formattedAppointment }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching appointment:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/appointments/[id] - Delete an appointment (soft delete by setting status to cancelled)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Soft delete by setting status to cancelled
    await prisma.appointment.update({
      where: { id },
      data: {
        status: "cancelled",
      },
    });

    // Log appointment cancellation
    const headersList = await headers();
    const { ipAddress, userAgent } = getRequestInfo(headersList);
    await logAudit({
      userId: existingAppointment.clientId ?? undefined,
      action: "DELETE_APPOINTMENT",
      entityType: "APPOINTMENT",
      entityId: id,
      details: {
        title: existingAppointment.title,
        date: existingAppointment.date.toISOString(),
      },
      ipAddress,
      userAgent,
      success: true,
    });

    return NextResponse.json({ message: "Appointment cancelled successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting appointment:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
