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
 * Check for appointment conflicts using Allen's Interval Algebra
 *
 * Algorithm: Allen's Interval Algebra (1983)
 * Reference: Allen, J. F. "Maintaining knowledge about temporal intervals"
 *
 * Detects if two time intervals overlap using the formula:
 * Overlap(A, B) = (A.start < B.end) ∧ (A.end > B.start)
 *
 * This checks 5 of Allen's 13 temporal relations:
 * 1. Overlaps: New starts during existing
 * 2. Overlapped-by: New ends during existing
 * 3. During: New is contained within existing
 * 4. Contains: New completely contains existing
 * 5. Starts/Finishes: New shares boundary with existing
 *
 * @param picId - PIC user ID
 * @param date - Appointment date (YYYY-MM-DD)
 * @param startTime - Start time (HH:mm format)
 * @param endTime - End time (HH:mm format)
 * @returns NextResponse with error if conflict found, null otherwise
 */
export async function checkAppointmentConflictForCreate(
  picId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<NextResponse | null> {
  // Find all non-cancelled appointments for this PIC on the same date
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      picId,
      date: new Date(date),
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

  // Apply Allen's Interval Algebra overlap detection
  for (const existing of existingAppointments) {
    const newStart = startTime;
    const newEnd = endTime;
    const existingStart = existing.startTime;
    const existingEnd = existing.endTime;

    // Check overlap using Allen's formula: (A.start < B.end) ∧ (A.end > B.start)
    const hasOverlap = newStart < existingEnd && newEnd > existingStart;

    if (hasOverlap) {
      return NextResponse.json(
        {
          error: `Schedule conflict detected. PIC already has an appointment at this time.`,
          conflict: {
            title: existing.title,
            client: existing.client.fullname,
            time: `${existingStart} - ${existingEnd}`,
            message: `The requested time slot (${startTime} - ${endTime}) overlaps with existing appointment "${existing.title}" scheduled from ${existingStart} to ${existingEnd}.`,
          },
        },
        { status: 409 } // 409 Conflict
      );
    }
  }

  return null;
}

/**
 * Validate Google Calendar connection for online appointments
 */
export async function validateGoogleCalendarConnection(
  picId: string,
  type: string
): Promise<NextResponse | null> {
  if (type === "online") {
    const pic = await prisma.userProfile.findUnique({
      where: { id: picId },
      select: { googleAccessToken: true },
    });

    if (!pic?.googleAccessToken) {
      return NextResponse.json(
        {
          error:
            "PIC must connect their Google Calendar before creating online appointments. Please visit the Availability page to connect.",
        },
        { status: 400 }
      );
    }
  }

  return null;
}
