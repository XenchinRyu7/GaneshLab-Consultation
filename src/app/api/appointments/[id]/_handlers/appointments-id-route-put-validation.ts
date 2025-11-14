/**
 * Validation functions for PUT /api/appointments/[id]
 */

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * Check for appointment conflicts
 */
export async function checkAppointmentConflict(
  picId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeAppointmentId: string
): Promise<NextResponse | null> {
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      picId,
      date,
      id: {
        not: excludeAppointmentId,
      },
      status: {
        not: "cancelled",
      },
      OR: [
        {
          AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
        },
        {
          AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
        },
        {
          AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
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

  return null;
}
