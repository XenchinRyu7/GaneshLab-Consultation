/**
 * PUT handler for PIC availability route
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

import { groupAvailabilitiesByDay } from "../_helpers/availability-route-helpers";

import { buildSlotsToCreateWithDates } from "./availability-put-helpers";
import { validateAllSlots, validatePutAuthorization } from "./availability-put-validators";

/**
 * PUT /api/pic/availability - Update PIC availability schedule
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const authError = validatePutAuthorization(user);
    if (authError) return authError;

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { availabilities, weekStart: weekStartStr } = body;

    const validationError = validateAllSlots(availabilities);
    if (validationError) return validationError;

    // Get start of week from request or default to current week
    let startOfWeek: Date;
    if (weekStartStr) {
      // Parse as ISO date string (YYYY-MM-DD) and create UTC date to avoid timezone issues
      const [year, month, day] = weekStartStr.split("-").map(Number);
      startOfWeek = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    } else {
      // Default to current week (Monday) using UTC
      const now = new Date();
      const dayOfWeek = now.getUTCDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth();
      const date = now.getUTCDate() + diff;
      startOfWeek = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
    }

    // Calculate end of week using UTC (Sunday = day 6 from Monday)
    // To include full Sunday, we set endOfWeek to Monday of next week minus 1ms
    const startDateStr = startOfWeek.toISOString().split("T")[0];
    const [endYear, endMonth, endDay] = startDateStr.split("-").map(Number);
    const nextMonday = new Date(Date.UTC(endYear, endMonth - 1, endDay + 7, 0, 0, 0, 0));
    const endOfWeek = new Date(nextMonday.getTime() - 1);
    // Use lt (less than) for delete to match query behavior
    const deleteEndDate = new Date(endOfWeek.getTime() + 1);

    // Delete existing availabilities for this week only
    await prisma.picAvailability.deleteMany({
      where: {
        picId: user.id,
        date: {
          gte: startOfWeek,
          lt: deleteEndDate,
        },
      },
    });

    // Create slots with specific dates for current week
    const slotsToCreate = buildSlotsToCreateWithDates(
      availabilities as Record<string, unknown[]>,
      user.id,
      startOfWeek
    );

    if (slotsToCreate.length > 0) {
      await prisma.picAvailability.createMany({
        data: slotsToCreate,
      });
    }

    // Fetch updated availabilities for current week
    // Use lt (less than) to match query behavior
    const updatedAvailabilities = await prisma.picAvailability.findMany({
      where: {
        picId: user.id,
        date: {
          gte: startOfWeek,
          lt: deleteEndDate,
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Convert date-based slots back to day-of-week format for UI compatibility
    const availabilityByDay = groupAvailabilitiesByDay(updatedAvailabilities);

    return NextResponse.json(
      {
        message: "Availability updated successfully",
        availabilities: availabilityByDay,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating PIC availability:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
