/**
 * POST handler for /api/appointments
 */

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { logAudit, getRequestInfo } from "@/lib/audit-logger";
import { prisma } from "@/lib/prisma";

import { formatAppointment } from "../[id]/_handlers/appointments-id-route-put-format";

import { buildAppointmentData } from "./appointments-route-post-build";
import {
  validateDuration,
  validateRequiredFields,
  validateGoogleCalendarConnection,
} from "./appointments-route-post-validation";

type AppointmentRequestBody = {
  title: string;
  clientId: string;
  picId: string;
  projectId?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: "online" | "offline";
  description?: string;
  location?: string;
};

type AppointmentWithRelations = {
  id: string;
  title: string;
  clientId: string | null;
  picId: string | null;
  date: Date;
  startTime: string;
  endTime: string;
  type: string;
  description: string | null;
  location: string | null;
  meetingLink: string | null;
  client?: {
    id: string;
    fullname: string;
    email: string;
  } | null;
  pic?: {
    id: string;
    fullname: string;
    email: string;
    googleAccessToken: string | null;
    googleRefreshToken: string | null;
    googleTokenExpiry: Date | null;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
};

/**
 * Validate all appointment input data
 */
async function validateAppointmentData(body: AppointmentRequestBody) {
  // Validate required fields
  const requiredFieldsError = validateRequiredFields(body);
  if (requiredFieldsError) return requiredFieldsError;

  // Validate duration
  const durationError = validateDuration(body.duration);
  if (durationError) return durationError;

  // Validate Google Calendar connection for online appointments
  const calendarError = await validateGoogleCalendarConnection(body.picId, body.type);
  if (calendarError) return calendarError;

  // Validate project status if projectId is provided
  if (body.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: body.projectId },
      select: { status: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.status !== "APPROVED" && project.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Appointments can only be created for approved or active projects" },
        { status: 403 }
      );
    }
  }

  return null; // No validation errors
}

/**
 * Create appointment with conflict checking in transaction
 */
async function createAppointmentWithTransaction(body: AppointmentRequestBody) {
  const appointmentData = buildAppointmentData(body);

  // Use transaction to prevent race condition: check conflict and create atomically
  const appointment = await prisma.$transaction(async tx => {
    // Check for conflicts within transaction
    const existingAppointments = await tx.appointment.findMany({
      where: {
        picId: body.picId,
        date: new Date(body.date),
        status: {
          not: "cancelled",
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        title: true,
        client: {
          select: {
            fullname: true,
          },
        },
      },
    });

    // Apply Allen's overlap formula
    for (const existing of existingAppointments) {
      const newStart = body.startTime;
      const newEnd = body.endTime;
      const existingStart = existing.startTime;
      const existingEnd = existing.endTime;

      const hasOverlap = newStart < existingEnd && newEnd > existingStart;

      if (hasOverlap) {
        throw new Error(
          `Konflik jadwal terdeteksi. PIC sudah memiliki appointment pada waktu ini. Detail: "${existing.title}" dengan ${existing.client?.fullname ?? "Tamu"} dari ${existingStart} sampai ${existingEnd}.`
        );
      }
    }

    // Create appointment within transaction
    return await tx.appointment.create({
      data: appointmentData,
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
            googleAccessToken: true,
            googleRefreshToken: true,
            googleTokenExpiry: true,
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
  });

  return appointment;
}

/**
 * Handle Google Calendar integration and Meet link creation
 */
async function handleCalendarIntegration(appointment: AppointmentWithRelations) {
  let meetLink = null;
  if (
    appointment.type === "online" &&
    appointment.pic &&
    appointment.pic.googleAccessToken &&
    appointment.client
  ) {
    try {
      const { createCalendarEventWithMeet } = await import("@/lib/google-calendar");

      const calendarData = await createCalendarEventWithMeet(appointment.pic, {
        summary: `Appointment: ${appointment.title}`,
        description: `Client: ${appointment.client.fullname}\nType: ${appointment.type}\n${appointment.description ?? ""}`,
        start: new Date(`${appointment.date.toISOString().split("T")[0]}T${appointment.startTime}`),
        end: new Date(`${appointment.date.toISOString().split("T")[0]}T${appointment.endTime}`),
        attendees: [appointment.client.email],
        type: appointment.type as "online" | "offline",
        location: appointment.location ?? undefined,
      });

      if (calendarData?.meetLink) {
        meetLink = calendarData.meetLink;
        // Update appointment dengan meet link
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { meetingLink: meetLink },
        });
      }
    } catch (calendarError) {
      console.warn("Failed to create calendar event:", calendarError);
      // Continue tanpa error - appointment tetap dibuat
    }
  }

  return meetLink;
}

/**
 * Create notifications for client and PIC
 */
async function createAppointmentNotifications(appointment: AppointmentWithRelations) {
  try {
    // Notify client
    if (appointment.clientId) {
      await prisma.notification.create({
        data: {
          userId: appointment.clientId,
          title: "Appointment Confirmed",
          message: `Your appointment "${appointment.title}" is scheduled for ${appointment.date.toLocaleDateString()} at ${appointment.startTime}`,
          type: "APPOINTMENT",
          actionUrl: `/dashboard/appointment`,
        },
      });
    }

    // Notify PIC
    if (appointment.picId) {
      await prisma.notification.create({
        data: {
          userId: appointment.picId,
          title: "New Appointment",
          message: `New appointment "${appointment.title}" with ${appointment.client?.fullname ?? "Client"}`,
          type: "APPOINTMENT",
          actionUrl: `/dashboard/appointment`,
        },
      });
    }
  } catch (notifError) {
    console.error("Error creating notifications:", notifError);
    // Don't fail the request if notification creation fails
  }
}

/**
 * Log appointment creation audit
 */
async function logAppointmentCreation(appointment: AppointmentWithRelations) {
  const headersList = await headers();
  const { ipAddress, userAgent } = getRequestInfo(headersList);
  await logAudit({
    userId: appointment.clientId ?? undefined,
    action: "CREATE_APPOINTMENT",
    entityType: "APPOINTMENT",
    entityId: appointment.id,
    details: {
      title: appointment.title,
      picId: appointment.picId ?? undefined,
      date: appointment.date.toISOString(),
      type: appointment.type,
    },
    ipAddress,
    userAgent,
    success: true,
  });
}

/**
 * POST /api/appointments - Create a new appointment
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate all input data
    const validationError = await validateAppointmentData(body);
    if (validationError) return validationError;

    // Create appointment with conflict checking
    const appointment = await createAppointmentWithTransaction(body);

    // Handle calendar integration
    const meetLink = await handleCalendarIntegration(appointment);

    // Create notifications
    await createAppointmentNotifications(appointment);

    // Log audit
    await logAppointmentCreation(appointment);

    // Format and return response
    const formattedAppointment = formatAppointment({ ...appointment, meetingLink: meetLink });
    return NextResponse.json({ appointment: formattedAppointment }, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Check if it's a conflict error from transaction
    if (errorMessage.includes("Konflik jadwal terdeteksi")) {
      return NextResponse.json(
        {
          error: "Schedule conflict detected. PIC already has an appointment at this time.",
          conflict: {
            message: errorMessage,
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
