import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  meetingType: "online" | "offline";
}

// GET /api/pic/availability - Get PIC availability schedule
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only PIC and Admin can access this endpoint
    if (user.role !== "pic" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get picId from query params (for viewing other PIC's schedule)
    const { searchParams } = new URL(req.url);
    const picIdParam = searchParams.get("picId");
    
    // Use provided picId or current user's id (PIC can view their own schedule by default)
    const targetPicId = picIdParam || user.id;
    
    // If viewing another PIC's schedule, verify user is PIC or Admin
    if (targetPicId !== user.id && user.role !== "admin") {
      // Allow PICs to view other PICs' schedules
      // This enables collaboration between PICs
    }

    // Get PIC availability (multiple slots per day)
    const availabilities = await prisma.pICAvailability.findMany({
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
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    // Group by day of week
    const availabilityByDay: Record<string, AvailabilitySlot[]> = {};
    DAYS_OF_WEEK.forEach((day) => {
      availabilityByDay[day] = [];
    });

    availabilities.forEach((avail) => {
      availabilityByDay[avail.dayOfWeek].push({
        id: avail.id,
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
        meetingType: avail.meetingType,
      });
    });

    // Get PIC name from database if not in availability records
    let picName: string | null = null;
    if (availabilities.length > 0 && availabilities[0]?.pic) {
      picName = availabilities[0].pic.fullname;
    } else {
      // If no availabilities, fetch PIC info separately
      const picInfo = await prisma.userProfile.findUnique({
        where: { id: targetPicId },
        select: { fullname: true },
      });
      picName = picInfo?.fullname || null;
    }

    return NextResponse.json(
      { 
        availabilities: availabilityByDay,
        picId: targetPicId,
        picName: picName,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching PIC availability:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/pic/availability - Update PIC availability schedule
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only PIC can access this endpoint
    if (user.role !== "pic") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { availabilities } = body; // { monday: [...], tuesday: [...], ... }

    if (!availabilities || typeof availabilities !== "object") {
      return NextResponse.json(
        { error: "Availabilities object is required" },
        { status: 400 }
      );
    }

    // Validate all slots
    for (const day of DAYS_OF_WEEK) {
      const slots = availabilities[day] || [];
      if (!Array.isArray(slots)) {
        return NextResponse.json(
          { error: `Invalid slots format for ${day}. Must be an array.` },
          { status: 400 }
        );
      }

      for (const slot of slots) {
        if (!DAYS_OF_WEEK.includes(slot.dayOfWeek as any)) {
          return NextResponse.json(
            { error: `Invalid dayOfWeek: ${slot.dayOfWeek}` },
            { status: 400 }
          );
        }

        if (!slot.startTime || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.startTime)) {
          return NextResponse.json(
            { error: `Invalid startTime format: ${slot.startTime}. Use HH:MM format` },
            { status: 400 }
          );
        }

        if (!slot.endTime || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.endTime)) {
          return NextResponse.json(
            { error: `Invalid endTime format: ${slot.endTime}. Use HH:MM format` },
            { status: 400 }
          );
        }

        if (slot.startTime >= slot.endTime) {
          return NextResponse.json(
            { error: `startTime must be before endTime for ${slot.dayOfWeek}` },
            { status: 400 }
          );
        }

        if (!slot.meetingType || !["online", "offline"].includes(slot.meetingType)) {
          return NextResponse.json(
            { error: `Invalid meetingType: ${slot.meetingType}. Must be "online" or "offline"` },
            { status: 400 }
          );
        }
      }
    }

    // Delete all existing availabilities for this PIC
    await prisma.pICAvailability.deleteMany({
      where: {
        picId: user.id,
      },
    });

    // Create new availabilities
    const slotsToCreate: Array<{
      picId: string;
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
      meetingType: "online" | "offline";
    }> = [];

    for (const day of DAYS_OF_WEEK) {
      const slots = availabilities[day] || [];
      for (const slot of slots) {
        if (DAYS_OF_WEEK.includes(slot.dayOfWeek as DayOfWeek)) {
          slotsToCreate.push({
            picId: user.id,
            dayOfWeek: slot.dayOfWeek as DayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            meetingType: slot.meetingType,
          });
        }
      }
    }

    if (slotsToCreate.length > 0) {
      await prisma.pICAvailability.createMany({
        data: slotsToCreate,
      });
    }

    // Fetch updated availabilities
    const updatedAvailabilities = await prisma.pICAvailability.findMany({
      where: {
        picId: user.id,
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    // Format response
    const availabilityByDay: Record<string, AvailabilitySlot[]> = {};
    DAYS_OF_WEEK.forEach((day) => {
      availabilityByDay[day] = [];
    });

    updatedAvailabilities.forEach((avail) => {
      availabilityByDay[avail.dayOfWeek].push({
        id: avail.id,
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
        meetingType: avail.meetingType,
      });
    });

    return NextResponse.json(
      {
        message: "Availability updated successfully",
        availabilities: availabilityByDay,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating PIC availability:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
