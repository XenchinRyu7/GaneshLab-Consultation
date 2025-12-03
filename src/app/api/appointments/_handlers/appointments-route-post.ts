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
  checkAppointmentConflictForCreate,
  validateDuration,
  validateRequiredFields,
  validateGoogleCalendarConnection,
} from "./appointments-route-post-validation";

/**
 * POST /api/appointments - Create a new appointment
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    const requiredFieldsError = validateRequiredFields(body);
    if (requiredFieldsError) return requiredFieldsError;

    // Validate duration
    const durationError = validateDuration(body.duration);
    if (durationError) return durationError;

    // Check for conflicts
    const conflictError = await checkAppointmentConflictForCreate(
      body.picId,
      body.date,
      body.startTime,
      body.endTime
    );
    if (conflictError) return conflictError;

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

    // Build appointment data
    const appointmentData = buildAppointmentData(body);

    // Create appointment
    const appointment = await prisma.appointment.create({
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
            googleAccessToken: true, // Tambah untuk check calendar connection
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

    // Auto-generate Google Meet link jika tipe online dan PIC sudah connect calendar
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
          start: new Date(
            `${appointment.date.toISOString().split("T")[0]}T${appointment.startTime}`
          ),
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

    // Log appointment creation
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

    // Format and return response
    const formattedAppointment = formatAppointment({ ...appointment, meetingLink: meetLink });
    return NextResponse.json({ appointment: formattedAppointment }, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
