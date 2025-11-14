/**
 * Types for PIC availability route
 */

export interface AvailabilitySlot {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  meetingType: "online" | "offline";
}
