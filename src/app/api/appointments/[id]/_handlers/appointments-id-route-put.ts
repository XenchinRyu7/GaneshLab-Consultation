/**
 * PUT handler for /api/appointments/[id]
 */

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { buildAppointmentUpdateData } from "./appointments-id-route-put-build";
import { formatAppointment } from "./appointments-id-route-put-format";
import {
  validateAppointmentConflicts,
  validateAppointmentExists,
} from "./appointments-id-route-put-helpers";

/**
 * PUT /api/appointments/[id] - Update an appointment
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Check if appointment exists
    const validationResult = await validateAppointmentExists(id);
    if (validationResult.error) return validationResult.error;
    const existingAppointment = validationResult.appointment;
    if (!existingAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Build update data
    const updateData = buildAppointmentUpdateData(body);

    // Check for conflicts if time or date changed
    const { hasConflict, error: conflictError } = await validateAppointmentConflicts(
      body,
      existingAppointment,
      id
    );
    if (hasConflict && conflictError) return conflictError;

    // Update appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
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

    // Create notifications for client and PIC
    try {
      if (appointment.clientId) {
        await prisma.notification.create({
          data: {
            userId: appointment.clientId,
            title: "Appointment Updated",
            message: `Your appointment "${appointment.title}" has been updated`,
            type: "INFO",
            actionUrl: `/dashboard/appointment`,
          },
        });
      }

      if (appointment.picId) {
        await prisma.notification.create({
          data: {
            userId: appointment.picId,
            title: "Appointment Updated",
            message: `Appointment "${appointment.title}" has been updated`,
            type: "INFO",
            actionUrl: `/dashboard/appointment`,
          },
        });
      }
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
      // Don't fail the request if notification creation fails
    }

    // Format and return response
    const formattedAppointment = formatAppointment(appointment);
    return NextResponse.json({ appointment: formattedAppointment }, { status: 200 });
  } catch (error) {
    console.error("Error updating appointment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
