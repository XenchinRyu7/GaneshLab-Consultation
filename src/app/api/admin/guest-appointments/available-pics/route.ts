import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/guest-appointments/available-pics
 * Get available PICs for a specific date and time
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required parameters: date, startTime, endTime" },
        { status: 400 }
      );
    }

    // Extract date string only (YYYY-MM-DD) if it's an ISO string
    const dateStr = date.includes("T") ? date.split("T")[0] : date;

    // Parse appointment date in UTC to avoid timezone issues
    const [year, month, day] = dateStr.split("-").map(Number);
    const appointmentDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // Get all PICs
    const allPics = await prisma.userProfile.findMany({
      where: { role: "pic" },
      select: {
        id: true,
        fullname: true,
        email: true,
      },
    });

    // Filter PICs based on availability
    const availablePics = [];

    for (const pic of allPics) {
      const checkResult = await checkPicAvailability(
        pic.id,
        appointmentDate,
        startTime,
        endTime,
        dateStr
      );

      if (checkResult.isAvailable) {
        availablePics.push(pic);
      }
    }

    return NextResponse.json({ pics: availablePics });
  } catch (error) {
    console.error("Error fetching available PICs:", error);
    return NextResponse.json({ error: "Failed to fetch available PICs" }, { status: 500 });
  }
}

/**
 * Helper function to check if a PIC is available at the given date/time
 */
async function checkPicAvailability(
  picId: string,
  appointmentDate: Date,
  startTime: string,
  endTime: string,
  dateStr: string
): Promise<{ isAvailable: boolean; skipReason?: string }> {
  // Step 1: Check if PIC has availability for this specific date
  const availabilities = await prisma.picAvailability.findMany({
    where: {
      picId,
      date: appointmentDate,
    },
  });

  if (availabilities.length === 0) {
    return { isAvailable: false, skipReason: `No availability on ${dateStr}` };
  }

  // Step 2: Check if requested time falls within working hours
  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const requestStart = parseTime(startTime);
  const requestEnd = parseTime(endTime);

  const isWithinWorkingHours = availabilities.some(availability => {
    const workStart = parseTime(availability.startTime);
    const workEnd = parseTime(availability.endTime);
    return requestStart >= workStart && requestEnd <= workEnd;
  });

  if (!isWithinWorkingHours) {
    return {
      isAvailable: false,
      skipReason: `Time ${startTime}-${endTime} outside working hours`,
    };
  }

  // Step 3: Check for blocked slots
  const blockedSlots = await prisma.picBlockedSlot.findMany({
    where: {
      picId,
      date: appointmentDate,
    },
  });

  const hasBlockedSlot = blockedSlots.some(blocked => {
    return startTime < blocked.endTime && endTime > blocked.startTime;
  });

  if (hasBlockedSlot) {
    return { isAvailable: false, skipReason: "Blocked slot" };
  }

  // Step 4: Check for existing appointments
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      picId,
      date: appointmentDate,
      status: { not: "cancelled" },
    },
  });

  const hasConflict = existingAppointments.some(appt => {
    return startTime < appt.endTime && endTime > appt.startTime;
  });

  if (hasConflict) {
    return { isAvailable: false, skipReason: "Conflicting appointment" };
  }

  return { isAvailable: true, skipReason: "Available" };
}
