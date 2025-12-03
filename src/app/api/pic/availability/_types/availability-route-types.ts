/**
 * Types for PIC availability route
 */

export interface AvailabilitySlot {
  id?: string;
  dayOfWeek: string; // For UI compatibility - derived from date
  startTime: string;
  endTime: string;
  meetingType: "online" | "offline";
  date?: string; // ISO date string (YYYY-MM-DD) - actual date in database
}
