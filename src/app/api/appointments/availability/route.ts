import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/appointments/availability - Get available time slots for PICs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const picId = searchParams.get("picId"); // Optional: filter by specific PIC
    const startDate = searchParams.get("startDate"); // YYYY-MM-DD
    const days = parseInt(searchParams.get("days") || "30"); // Number of days to generate

    if (!startDate) {
      return NextResponse.json({ error: "startDate is required" }, { status: 400 });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    // Get PICs to generate availability for
    let picIds: string[] = [];
    if (picId) {
      picIds = [picId];
    } else {
      // Get all PICs
      const pics = await prisma.userProfile.findMany({
        where: {
          role: "pic",
        },
        select: {
          id: true,
        },
      });
      picIds = pics.map((pic) => pic.id);
    }

    if (picIds.length === 0) {
      return NextResponse.json({ slots: [] }, { status: 200 });
    }

    // Get PIC availability (working hours) - multiple slots per day supported
    const picAvailabilities = await prisma.pICAvailability.findMany({
      where: {
        picId: {
          in: picIds,
        },
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    // Get PIC blocked slots
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + days);
    const blockedSlots = await prisma.pICBlockedSlot.findMany({
      where: {
        picId: {
          in: picIds,
        },
        date: {
          gte: start,
          lt: endDate,
        },
      },
    });

    // Get existing appointments (booked slots)
    const appointments = await prisma.appointment.findMany({
      where: {
        picId: {
          in: picIds,
        },
        date: {
          gte: start,
          lt: endDate,
        },
        status: {
          not: "cancelled",
        },
      },
      select: {
        picId: true,
        date: true,
        startTime: true,
        endTime: true,
      },
    });

    // Get PIC names
    const pics = await prisma.userProfile.findMany({
      where: {
        id: {
          in: picIds,
        },
      },
      select: {
        id: true,
        fullname: true,
      },
    });

    const picMap = new Map(pics.map((pic) => [pic.id, pic.fullname]));

    // Generate available slots
    const slots: Array<{
      pmId: string;
      pmName: string;
      date: string;
      startTime: string;
      endTime: string;
      type: "online" | "offline";
      available: boolean;
    }> = [];

    const dayOfWeekMap: Record<number, string> = {
      0: "sunday",
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: "saturday",
    };

    // Generate slots for each day
    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + dayOffset);
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayOfWeek = dayOfWeekMap[currentDate.getDay()];

      // Generate slots for each PIC
      for (const picId of picIds) {
        // Get all PIC availability slots for this day (can be multiple)
        const dayAvailabilities = picAvailabilities.filter(
          (avail) => avail.picId === picId && avail.dayOfWeek === dayOfWeek
        );

        // If no availability set, skip this day for this PIC
        if (dayAvailabilities.length === 0) {
          continue;
        }

        // Use availability slots as-is (don't split into hourly slots)
        for (const availability of dayAvailabilities) {
          const slotStartTime = availability.startTime;
          const slotEndTime = availability.endTime;

          // Check if the entire slot is blocked
          const isBlocked = blockedSlots.some(
            (blocked) =>
              blocked.picId === picId &&
              blocked.date.toISOString().split("T")[0] === dateStr &&
              // Check if blocked slot overlaps with availability slot
              ((blocked.startTime < slotEndTime && blocked.endTime > slotStartTime))
          );

          // Check if the entire slot is fully booked
          // For now, we'll show the slot even if partially booked
          // Client can still book appointments within the slot
          const hasAppointment = appointments.some(
            (apt) =>
              apt.picId === picId &&
              apt.date.toISOString().split("T")[0] === dateStr &&
              // Check if appointment overlaps with availability slot
              ((apt.startTime < slotEndTime && apt.endTime > slotStartTime))
          );

          // Only exclude if the entire slot is blocked
          // If partially booked, we still show it (client can book remaining time)
          if (!isBlocked) {
            // Use meetingType from availability
            const type: "online" | "offline" = availability.meetingType;

            slots.push({
              pmId: picId,
              pmName: picMap.get(picId) || "Unknown PIC",
              date: dateStr,
              startTime: slotStartTime,
              endTime: slotEndTime,
              type,
              available: !hasAppointment, // Mark as unavailable if fully booked (but we still show it)
            });
          }
        }
      }
    }

    // Sort slots by date, then by PIC, then by time
    slots.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.pmId !== b.pmId) return a.pmId.localeCompare(b.pmId);
      return a.startTime.localeCompare(b.startTime);
    });

    return NextResponse.json({ slots }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching availability:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

