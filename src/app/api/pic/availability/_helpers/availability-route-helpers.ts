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
 */
export function groupAvailabilitiesByDay(
  availabilities: Array<{
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    meetingType: "online" | "offline";
  }>
): Record<string, AvailabilitySlot[]> {
  const availabilityByDay: Record<string, AvailabilitySlot[]> = {};

  DAYS_OF_WEEK.forEach(day => {
    availabilityByDay[day] = [];
  });

  availabilities.forEach(avail => {
    // Validate dayOfWeek against whitelist to prevent prototype pollution
    if (DAYS_OF_WEEK.includes(avail.dayOfWeek as DayOfWeek)) {
      availabilityByDay[avail.dayOfWeek].push({
        id: avail.id,
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
        meetingType: avail.meetingType,
      });
    }
  });

  return availabilityByDay;
}
