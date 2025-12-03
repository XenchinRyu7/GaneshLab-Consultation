/**
 * Helper functions for PIC availability route
 */

import type { AvailabilitySlot } from "../_types/availability-route-types";

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

/**
 * Group availabilities by day of week
 * Converts date-based availability to day-of-week format for UI compatibility
 */
export function groupAvailabilitiesByDay(
  availabilities: Array<{
    id: string;
    date: Date | null;
    startTime: string;
    endTime: string;
    meetingType: "online" | "offline";
  }>
): Record<string, AvailabilitySlot[]> {
  const availabilityByDay: Record<DayOfWeek, AvailabilitySlot[]> = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  const dayNames: readonly string[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const;

  availabilities.forEach(avail => {
    if (!avail.date) return;

    // Parse date as UTC to avoid timezone issues
    const dateStr = avail.date.toISOString().split("T")[0];
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const dayIndex = date.getUTCDay(); // Use getUTCDay instead of getDay

    const slot: AvailabilitySlot = {
      id: avail.id,
      dayOfWeek: dayNames[dayIndex] || "monday",
      startTime: avail.startTime,
      endTime: avail.endTime,
      meetingType: avail.meetingType,
      date: dateStr,
    };

    switch (dayIndex) {
      case 0:
        availabilityByDay.sunday.push(slot);
        break;
      case 1:
        availabilityByDay.monday.push(slot);
        break;
      case 2:
        availabilityByDay.tuesday.push(slot);
        break;
      case 3:
        availabilityByDay.wednesday.push(slot);
        break;
      case 4:
        availabilityByDay.thursday.push(slot);
        break;
      case 5:
        availabilityByDay.friday.push(slot);
        break;
      case 6:
        availabilityByDay.saturday.push(slot);
        break;
    }
  });

  return availabilityByDay;
}
