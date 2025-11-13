/**
 * Validation functions for POST /api/appointments
 */

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * Validate required fields
 */
export function validateRequiredFields(body: {
  title?: unknown;
  clientId?: unknown;
  picId?: unknown;
  date?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  type?: unknown;
}): NextResponse | null {
  if (
    !body.title ||
    !body.clientId ||
    !body.picId ||
    !body.date ||
    !body.startTime ||
    !body.endTime ||
    !body.type
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  return null;
}

/**
 * Validate duration
 */
export function validateDuration(duration: unknown): NextResponse | null {
  if (!duration || Number(duration) <= 0) {
    return NextResponse.json({ error: "Duration must be greater than 0" }, { status: 400 });
  }
  return null;
}

/**
 * Check for appointment conflicts
 */
export async function checkAppointmentConflictForCreate(
  picId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<NextResponse | null> {
  const conflictingAppointment = await prisma.appointment.findFirst({
    where: {
      picId,
      date: new Date(date),
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
