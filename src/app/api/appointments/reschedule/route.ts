/**
 * GET /api/appointments/reschedule - Get reschedule requests for a client
 * POST /api/appointments/reschedule - PIC requests reschedule for appointment
 * PATCH /api/appointments/reschedule/[id] - Approve or reject reschedule request
 */

import { NextRequest, NextResponse } from "next/server";

import { logAudit, getRequestInfo } from "@/lib/audit-logger";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { sendRescheduleNotification } from "./_utils/notification-handler";

// GET /api/appointments/reschedule?clientId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 });
    }

    // Verify user is the client
    const user = await getCurrentUser();
    if (!user || user.id !== clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const requests = await prisma.rescheduleRequest.findMany({
      where: {
        appointment: {
          clientId,
        },
      },
      include: {
        appointment: {
          select: {
            title: true,
            pic: {
              select: {
                fullname: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching reschedule requests:", error);
    return NextResponse.json({ error: "Failed to fetch reschedule requests" }, { status: 500 });
  }
}

async function validateRescheduleRequest(
  appointmentId: string,
  userId: string,
  isGuestAppointment: boolean
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      pic: {
        select: {
          id: true,
          fullname: true,
          email: true,
        },
      },
      client: {
        select: {
          id: true,
          fullname: true,
          email: true,
        },
      },
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.picId !== userId) {
    throw new Error("You are not assigned to this appointment");
  }

  if (!isGuestAppointment) {
    const existingRequest = await prisma.rescheduleRequest.findFirst({
      where: {
        appointmentId,
        status: "pending",
      },
    });

    if (existingRequest) {
      throw new Error("Reschedule request already pending");
    }
  }

  return appointment;
}

// POST /api/appointments/reschedule - PIC requests reschedule for appointment
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "pic") {
      return NextResponse.json({ error: "Only PICs can request reschedule" }, { status: 403 });
    }

    const { appointmentId, reason, proposedDate, proposedStartTime, proposedEndTime } =
      await req.json();

    if (!appointmentId || !proposedDate || !proposedStartTime || !proposedEndTime) {
      return NextResponse.json(
        { error: "Appointment ID, proposed date and time are required" },
        { status: 400 }
      );
    }

    const appointment = await validateRescheduleRequest(appointmentId, session.id, false);

    const rescheduleRequest = await prisma.rescheduleRequest.create({
      data: {
        appointmentId,
        requestedById: session.id,
        reason: reason ?? "PIC requested reschedule",
        newDate: new Date(proposedDate),
        newStartTime: proposedStartTime,
        newEndTime: proposedEndTime,
        status: "pending",
      },
    });

    await sendRescheduleNotification({
      appointment,
      proposedDate,
      proposedStartTime,
      proposedEndTime,
      reason,
      rescheduleRequestId: rescheduleRequest.id,
    });

    const requestInfo = getRequestInfo(req.headers);
    await logAudit({
      userId: session.id,
      action: "REQUEST_APPOINTMENT_RESCHEDULE",
      entityType: "APPOINTMENT",
      entityId: appointmentId,
      details: {
        proposedDate,
        proposedStartTime,
        proposedEndTime,
        reason: reason ?? "No reason provided",
        isGuestAppointment: appointment.isGuestAppointment,
        guestEmail: appointment.guestEmail,
      },
      ...requestInfo,
    });

    return NextResponse.json({
      message: "Reschedule request submitted successfully",
      rescheduleRequest,
    });
  } catch (error) {
    console.error("Error requesting reschedule:", error);

    const requestInfo = getRequestInfo(req.headers);
    await logAudit({
      action: "REQUEST_APPOINTMENT_RESCHEDULE",
      entityType: "APPOINTMENT",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      ...requestInfo,
    });

    if (error instanceof Error) {
      if (error.message === "Appointment not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "You are not assigned to this appointment") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message === "Reschedule request already pending") {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Failed to request reschedule" }, { status: 500 });
  }
}
