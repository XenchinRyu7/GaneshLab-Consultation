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

  for (const day of DAYS_OF_WEEK) {
    const slots = availabilities[day] ?? [];
    if (!Array.isArray(slots) || slots.length === 0) {
      continue;
    }

    const dayIndex = dayIndexMap[day];

    for (const slot of slots) {
      const slotObj = slot as Record<string, unknown>;

      // Calculate specific date for this day of week (UTC to avoid timezone shift)
      const year = startOfWeek.getFullYear();
      const month = startOfWeek.getMonth();
      const date = startOfWeek.getDate() + dayIndex;

      // Create date in UTC using Date.UTC
      const slotDate = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));

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

/**
 * Convert date-based slots back to day-of-week format for UI compatibility
 */
export function convertToAvailabilityByDay(
  updatedAvailabilities: Array<{
    date: Date;
    startTime: string;
    endTime: string;
    meetingType: string;
  }>
): Record<
  string,
  Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    meetingType: string;
    date: string;
  }>
> {
  const availabilityByDay: Record<
    string,
    Array<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      meetingType: string;
      date: string;
    }>
  > = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  for (const avail of updatedAvailabilities) {
    // Parse date as UTC to avoid timezone issues
    const dateStr = avail.date.toISOString().split("T")[0];
    const [year, month, day] = dateStr.split("-").map(Number);

    // Create date in UTC to avoid timezone shift
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const dayOfWeek = dayNames[date.getUTCDay()];

    availabilityByDay[dayOfWeek].push({
      dayOfWeek,
      startTime: avail.startTime,
      endTime: avail.endTime,
      meetingType: avail.meetingType,
      date: dateStr,
    });
  }

  return availabilityByDay;
}
