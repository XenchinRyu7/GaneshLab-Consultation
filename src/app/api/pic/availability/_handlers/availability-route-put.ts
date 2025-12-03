/**
 * PUT handler for PIC availability route
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

import {
  buildSlotsToCreateWithDates,
  convertToAvailabilityByDay,
} from "./availability-put-helpers";
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
    const { availabilities } = body;

    const validationError = validateAllSlots(availabilities);
    if (validationError) return validationError;

    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + diff,
      0,
      0,
      0,
      0
    );

    const endOfWeek = new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 6,
      23,
      59,
      59,
      999
    );

    // Delete existing availabilities for this week only
    await prisma.picAvailability.deleteMany({
      where: {
        picId: user.id,
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
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
    const updatedAvailabilities = await prisma.picAvailability.findMany({
      where: {
        picId: user.id,
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Convert date-based slots back to day-of-week format for UI compatibility
    const availabilityByDay = convertToAvailabilityByDay(updatedAvailabilities);

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
