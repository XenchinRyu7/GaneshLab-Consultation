/**
 * Helper functions for appointments PUT handler
 */

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { checkAppointmentConflict } from "./appointments-id-route-put-validation";

/**
 * Validate appointment exists
 */
export async function validateAppointmentExists(
  id: string
): Promise<
  | { appointment: Awaited<ReturnType<typeof prisma.appointment.findUnique>>; error: null }
  | { appointment: null; error: NextResponse<{ error: string }> }
> {
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!existingAppointment) {
    return {
      appointment: null,
      error: NextResponse.json({ error: "Appointment not found" }, { status: 404 }),
    };
  }

  return { appointment: existingAppointment, error: null };
}

/**
 * Check for appointment conflicts if time/date changed
 */
export async function validateAppointmentConflicts(
  body: { date?: string; startTime?: string; endTime?: string; picId?: string },
  existingAppointment: { picId: string | null; date: Date; startTime: string; endTime: string },
  appointmentId: string
) {
  if (body.date || body.startTime || body.endTime) {
    const picId = body.picId ?? existingAppointment.picId;

    // Skip conflict check for guest appointments (no picId)
    if (!picId) {
      return { hasConflict: false, error: null };
    }

    const date = body.date ? new Date(body.date) : existingAppointment.date;
    const startTime = body.startTime ?? existingAppointment.startTime;
    const endTime = body.endTime ?? existingAppointment.endTime;

    const conflictError = await checkAppointmentConflict(
      picId,
      date,
      startTime,
      endTime,
      appointmentId
    );
    if (conflictError) {
      return { hasConflict: true, error: conflictError };
    }
  }

  return { hasConflict: false, error: null };
}
