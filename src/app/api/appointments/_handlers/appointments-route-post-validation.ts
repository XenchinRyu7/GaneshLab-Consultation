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
 * ============================================================================
 * 13 RELASI TEMPORAL ALLEN (LENGKAP)
 * ============================================================================
 *
 * Notasi: I = Interval Baru, J = Interval Existing
 *         I_- = I_start, I_+ = I_end, J_- = J_start, J_+ = J_end
 *
 * NO. | RELASI         | SIMBOL | KONDISI FORMAL             | KONFLIK?
 * ----|----------------|--------|----------------------------|----------
 * 1.  | Before         | I < J  | I_+ < J_-                  | TIDAK ✓
 * 2.  | After          | I > J  | I_- > J_+                  | TIDAK ✓
 * 3.  | Meets          | I m J  | I_+ = J_-                  | TIDAK ✓
 * 4.  | Met-by         | I M J  | I_- = J_+                  | TIDAK ✓
 * 5.  | Overlaps       | I o J  | I_- < J_- < I_+ < J_+      | KONFLIK ✓
 * 6.  | Overlapped-by  | I O J  | J_- < I_- < J_+ < I_+      | KONFLIK ✓
 * 7.  | Starts         | I s J  | I_- = J_- ∧ I_+ < J_+      | KONFLIK ✓
 * 8.  | Started-by     | I S J  | I_- = J_- ∧ I_+ > J_+      | KONFLIK ✓
 * 9.  | Finishes       | I f J  | I_- > J_- ∧ I_+ = J_+      | KONFLIK ✓
 * 10. | Finished-by    | I F J  | I_- < J_- ∧ I_+ = J_+      | KONFLIK ✓
 * 11. | During         | I d J  | J_- < I_- ∧ I_+ < J_+      | KONFLIK ✓
 * 12. | Contains       | I D J  | I_- < J_- ∧ J_+ < I_+      | KONFLIK ✓
 * 13. | Equals         | I = J  | I_- = J_- ∧ I_+ = J_+      | KONFLIK ✓
 *
 * ============================================================================
 * METODE DETEKSI KONFLIK (OPTIMASI)
 * ============================================================================
 *
 * Daripada memeriksa 13 kondisi secara individual, sistem menggunakan
 * formula tunggal yang mendeteksi SEMUA relasi konflik (5-13) sekaligus:
 *
 *   Overlap(I, J) = (I_start < J_end) ∧ (I_end > J_start)
 *
 * Formula ini mendeteksi tumpang tindih waktu dengan memeriksa:
 * 1. Apakah interval baru MULAI sebelum interval existing SELESAI?
 * 2. Apakah interval baru SELESAI setelah interval existing MULAI?
 *
 * Jika KEDUA kondisi terpenuhi, maka terdapat konflik jadwal.
 *
 * ============================================================================
 * CONTOH PERHITUNGAN
 * ============================================================================
 *
 * Contoh 1 - ADA KONFLIK (Relasi: Overlaps):
 * - Existing (J): 10:00 - 11:00
 * - New (I):      10:30 - 11:30
 *
 * Perhitungan:
 *   I_start < J_end  →  10:30 < 11:00  →  TRUE
 *   I_end > J_start  →  11:30 > 10:00  →  TRUE
 *   TRUE ∧ TRUE = TRUE → KONFLIK TERDETEKSI ✓
 *
 * Contoh 2 - TIDAK KONFLIK (Relasi: Meets):
 * - Existing (J): 10:00 - 11:00
 * - New (I):      11:00 - 12:00
 *
 * Perhitungan:
 *   I_start < J_end  →  11:00 < 11:00  →  FALSE
 *   I_end > J_start  →  12:00 > 10:00  →  TRUE
 *   FALSE ∧ TRUE = FALSE → TIDAK ADA KONFLIK ✓
 *
 * @param picId - PIC user ID
 * @param date - Appointment date (YYYY-MM-DD)
 * @param startTime - Start time (HH:mm format, I_start)
 * @param endTime - End time (HH:mm format, I_end)
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
    // Interval I (appointment baru yang diajukan)
    const newStart = startTime; // I_start
    const newEnd = endTime; // I_end

    // Interval J (appointment yang sudah ada)
    const existingStart = existing.startTime; // J_start
    const existingEnd = existing.endTime; // J_end

    // Formula deteksi konflik Allen's Interval Algebra:
    // Overlap(I, J) = (I_start < J_end) ∧ (I_end > J_start)
    const hasOverlap = newStart < existingEnd && newEnd > existingStart;

    if (hasOverlap) {
      return NextResponse.json(
        {
          error: `Schedule conflict detected. PIC already has an appointment at this time.`,
          conflict: {
            title: existing.title,
            client: existing.client?.fullname ?? "Guest",
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
