/**
 * POST handler for /api/appointments
 */

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { formatAppointment } from "../[id]/_handlers/appointments-id-route-put-format";

import { buildAppointmentData } from "./appointments-route-post-build";
import {
  checkAppointmentConflictForCreate,
  validateDuration,
  validateRequiredFields,
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

    // Format and return response
    const formattedAppointment = formatAppointment(appointment);
    return NextResponse.json({ appointment: formattedAppointment }, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
