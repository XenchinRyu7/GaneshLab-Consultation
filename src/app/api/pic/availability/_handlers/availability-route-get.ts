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
 * GET /api/pic/availability - Get PIC availability schedule
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const authError = validateAuthorization(user);
    if (authError) return authError;

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const targetPicId = getTargetPicId(req, user.id);

    // Get PIC availability
    const availabilities = await prisma.picAvailability.findMany({
      where: {
        picId: targetPicId,
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
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
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
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching PIC availability:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
