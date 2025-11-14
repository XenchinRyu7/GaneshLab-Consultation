/**
 * GET handler for /api/appointments/availability
 */

import { NextRequest, NextResponse } from "next/server";

import {
  getBlockedSlots,
  getExistingAppointments,
  getPicAvailabilities,
  getPicIds,
  getPicNamesMap,
} from "./availability-route-get-helpers";
import { generateAvailableSlots } from "./availability-route-get-slots";

/**
 * GET /api/appointments/availability - Get available time slots for PICs
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const picId = searchParams.get("picId");
    const startDate = searchParams.get("startDate");
    const days = parseInt(searchParams.get("days") ?? "30");

    if (!startDate) {
      return NextResponse.json({ error: "startDate is required" }, { status: 400 });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    // Get PIC IDs
    const picIds = await getPicIds(picId);
    if (picIds.length === 0) {
      return NextResponse.json({ slots: [] }, { status: 200 });
    }

    // Get all required data in parallel
    const [picAvailabilities, blockedSlots, appointments, picMap] = await Promise.all([
      getPicAvailabilities(picIds),
      getBlockedSlots(picIds, start, new Date(start.getTime() + days * 24 * 60 * 60 * 1000)),
      getExistingAppointments(
        picIds,
        start,
        new Date(start.getTime() + days * 24 * 60 * 60 * 1000)
      ),
      getPicNamesMap(picIds),
    ]);

    // Generate available slots
    const slots = generateAvailableSlots(
      picIds,
      days,
      start,
      picAvailabilities,
      blockedSlots,
      appointments,
      picMap
    );

    return NextResponse.json({ slots }, { status: 200 });
  } catch (error) {
    console.error("Error fetching availability:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
