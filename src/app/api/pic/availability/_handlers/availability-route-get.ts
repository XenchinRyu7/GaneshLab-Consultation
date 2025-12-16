/**
 * GET handler for PIC availability route
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

import { groupAvailabilitiesByDay } from "../_helpers/availability-route-helpers";

/**
 * Validate user authorization
 */
function validateAuthorization(user: { role: string } | null): NextResponse | null {
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "pic" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

/**
 * Get target PIC ID from query params or user ID
 */
function getTargetPicId(req: NextRequest, userId: string): string {
  const { searchParams } = new URL(req.url);
  const picIdParam = searchParams.get("picId");
  return picIdParam ?? userId;
}

/**
 * Get PIC name from availability records or database
 */
async function getPicName(
  availabilities: Array<{ pic: { fullname: string } | null }>,
  targetPicId: string
): Promise<string | null> {
  if (availabilities.length > 0 && availabilities[0]?.pic) {
    return availabilities[0].pic.fullname;
  }

  const picInfo = await prisma.userProfile.findUnique({
    where: { id: targetPicId },
    select: { fullname: true },
  });

  return picInfo?.fullname ?? null;
}

/**
 * Get start and end of week from weekStart date string
 */
function getWeekRange(weekStartStr: string | null): { startOfWeek: Date; endOfWeek: Date } {
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

  const startDateStr = startOfWeek.toISOString().split("T")[0];
  const [endYear, endMonth, endDay] = startDateStr.split("-").map(Number);
  // Sunday is 6 days after Monday (0-6 = 7 days total)
  // To include full Sunday, we set endOfWeek to Monday of next week minus 1ms
  const nextMonday = new Date(Date.UTC(endYear, endMonth - 1, endDay + 7, 0, 0, 0, 0));
  const endOfWeek = new Date(nextMonday.getTime() - 1);

  return { startOfWeek, endOfWeek };
}

/**
 * GET /api/pic/availability - Get PIC availability schedule
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const authError = validateAuthorization(user);
    if (authError) return authError;

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const targetPicId = getTargetPicId(req, user.id);
    const { searchParams } = new URL(req.url);
    const weekStartStr = searchParams.get("weekStart");

    // Get week range
    const { startOfWeek, endOfWeek } = getWeekRange(weekStartStr);

    // Get PIC availability for the selected week (7 days: Monday to Sunday)
    // Match appointment API: use lt (less than) for endDate
    // Since date is stored as DATE in DB, we need to compare properly
    // endOfWeek is Sunday 23:59:59.999, add 1ms to get Monday 00:00:00.000
    const queryEndDate = new Date(endOfWeek.getTime() + 1);

    const availabilities = await prisma.picAvailability.findMany({
      where: {
        picId: targetPicId,
        date: {
          gte: startOfWeek,
          lt: queryEndDate,
        },
      },
      include: {
        pic: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    // Group by day of week
    const availabilityByDay = groupAvailabilitiesByDay(availabilities);

    // Get PIC name
    const picName = await getPicName(availabilities, targetPicId);

    return NextResponse.json(
      {
        availabilities: availabilityByDay,
        picId: targetPicId,
        picName: picName,
        weekStart: startOfWeek.toISOString().split("T")[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching PIC availability:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
