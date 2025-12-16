/**
 * Helper functions for building availability slots
 */

import { DAYS_OF_WEEK } from "../_helpers/availability-route-helpers";

/**
 * Build slots with specific dates for the current week
 */
export function buildSlotsToCreateWithDates(
  availabilities: Record<string, unknown[]>,
  userId: string,
  startOfWeek: Date
): Array<{
  picId: string;
  date: Date;
  startTime: string;
  endTime: string;
  meetingType: "online" | "offline";
}> {
  const slotsToCreate: Array<{
    picId: string;
    date: Date;
    startTime: string;
    endTime: string;
    meetingType: "online" | "offline";
  }> = [];

  // Map day names to day offset from Monday (0 = Monday, 6 = Sunday)
  const dayIndexMap: Record<string, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };

  // Parse startOfWeek as ISO date string (YYYY-MM-DD) to avoid timezone issues
  const weekStartStr = startOfWeek.toISOString().split("T")[0];
  const [weekYear, weekMonth, weekDay] = weekStartStr.split("-").map(Number);

  for (const day of DAYS_OF_WEEK) {
    const slots = availabilities[day] ?? [];
    if (!Array.isArray(slots) || slots.length === 0) {
      continue;
    }

    const dayIndex = dayIndexMap[day];

    for (const slot of slots) {
      const slotObj = slot as Record<string, unknown>;

      // Use date from slot if available (for proper date handling), otherwise calculate from weekStart
      let slotDate: Date;
      if (slotObj.date && typeof slotObj.date === "string") {
        // Parse date string (YYYY-MM-DD) and create UTC date
        const [year, month, dayNum] = slotObj.date.split("-").map(Number);
        slotDate = new Date(Date.UTC(year, month - 1, dayNum, 0, 0, 0, 0));
      } else {
        // Calculate specific date for this day of week using UTC to avoid timezone shift
        // weekMonth - 1 because Date.UTC expects 0-indexed month
        slotDate = new Date(Date.UTC(weekYear, weekMonth - 1, weekDay + dayIndex, 0, 0, 0, 0));
      }

      slotsToCreate.push({
        picId: userId,
        date: slotDate,
        startTime: slotObj.startTime as string,
        endTime: slotObj.endTime as string,
        meetingType: slotObj.meetingType as "online" | "offline",
      });
    }
  }

  return slotsToCreate;
}
