/**
 * Validation functions for PIC availability PUT requests
 */

import { NextResponse } from "next/server";

import { DAYS_OF_WEEK, type DayOfWeek } from "../_helpers/availability-route-helpers";

/**
 * Validate user authorization for PUT
 */
export function validatePutAuthorization(user: { role: string } | null): NextResponse | null {
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "pic") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

/**
 * Validate slot object structure
 */
function validateSlotStructure(
  slot: unknown,
  day: string
): { isValid: boolean; slotObj?: Record<string, unknown>; error?: NextResponse } {
  if (typeof slot !== "object" || slot === null) {
    return {
      isValid: false,
      error: NextResponse.json({ error: `Invalid slot format for ${day}` }, { status: 400 }),
    };
  }
  return { isValid: true, slotObj: slot as Record<string, unknown> };
}

/**
 * Validate day of week
 */
function validateDayOfWeek(dayOfWeek: unknown): NextResponse | null {
  if (!DAYS_OF_WEEK.includes(dayOfWeek as DayOfWeek)) {
    return NextResponse.json({ error: `Invalid dayOfWeek: ${dayOfWeek}` }, { status: 400 });
  }
  return null;
}

/**
 * Validate time format
 */
function validateTimeFormat(time: unknown, fieldName: string): NextResponse | null {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!time || typeof time !== "string" || !timeRegex.test(time)) {
    return NextResponse.json(
      { error: `Invalid ${fieldName} format: ${time}. Use HH:MM format` },
      { status: 400 }
    );
  }
  return null;
}

/**
 * Validate time range
 */
function validateTimeRange(
  startTime: string,
  endTime: string,
  dayOfWeek: string
): NextResponse | null {
  if (startTime >= endTime) {
    return NextResponse.json(
      { error: `startTime must be before endTime for ${dayOfWeek}` },
      { status: 400 }
    );
  }
  return null;
}

/**
 * Validate meeting type
 */
function validateMeetingType(meetingType: unknown): NextResponse | null {
  if (!meetingType || !["online", "offline"].includes(meetingType as string)) {
    return NextResponse.json(
      { error: `Invalid meetingType: ${meetingType}. Must be "online" or "offline"` },
      { status: 400 }
    );
  }
  return null;
}

/**
 * Validate availability slot
 */
function validateSlot(slot: unknown, day: string): NextResponse | null {
  const { isValid, slotObj, error } = validateSlotStructure(slot, day);
  if (!isValid || !slotObj) return error ?? null;

  const dayError = validateDayOfWeek(slotObj.dayOfWeek);
  if (dayError) return dayError;

  const startTimeError = validateTimeFormat(slotObj.startTime, "startTime");
  if (startTimeError) return startTimeError;

  const endTimeError = validateTimeFormat(slotObj.endTime, "endTime");
  if (endTimeError) return endTimeError;

  const timeRangeError = validateTimeRange(
    slotObj.startTime as string,
    slotObj.endTime as string,
    slotObj.dayOfWeek as string
  );
  if (timeRangeError) return timeRangeError;

  const meetingTypeError = validateMeetingType(slotObj.meetingType);
  if (meetingTypeError) return meetingTypeError;

  return null;
}

/**
 * Check if two time ranges overlap
 */
function doTimeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  // Convert time strings to minutes for easier comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  // Two ranges overlap if: start1 < end2 && start2 < end1
  return start1Min < end2Min && start2Min < end1Min;
}

/**
 * Validate no overlapping slots in the same day
 */
function validateNoOverlaps(slots: unknown[], day: string): NextResponse | null {
  const validSlots = slots.filter(
    (slot): slot is { startTime: string; endTime: string; date?: string } =>
      typeof slot === "object" &&
      slot !== null &&
      "startTime" in slot &&
      "endTime" in slot &&
      typeof (slot as { startTime: unknown }).startTime === "string" &&
      typeof (slot as { endTime: unknown }).endTime === "string"
  );

  // Check for overlaps
  for (let i = 0; i < validSlots.length; i++) {
    for (let j = i + 1; j < validSlots.length; j++) {
      const slot1 = validSlots[i];
      const slot2 = validSlots[j];

      // Only check overlaps if they have the same date (if date field exists)
      const slot1Date = slot1.date;
      const slot2Date = slot2.date;

      // If both have dates and they're different, skip overlap check
      if (slot1Date && slot2Date && slot1Date !== slot2Date) {
        continue;
      }

      // Check if time ranges overlap
      if (doTimeRangesOverlap(slot1.startTime, slot1.endTime, slot2.startTime, slot2.endTime)) {
        return NextResponse.json(
          {
            error: `Overlapping time slots detected for ${day}: ${slot1.startTime}-${slot1.endTime} overlaps with ${slot2.startTime}-${slot2.endTime}`,
          },
          { status: 400 }
        );
      }
    }
  }

  return null;
}

/**
 * Validate all availability slots
 */
export function validateAllSlots(availabilities: unknown): NextResponse | null {
  if (typeof availabilities !== "object" || availabilities === null) {
    return NextResponse.json({ error: "Availabilities object is required" }, { status: 400 });
  }

  const availObj = availabilities as Record<string, unknown>;

  for (const day of DAYS_OF_WEEK) {
    const slots = availObj[day] ?? [];
    if (!Array.isArray(slots)) {
      return NextResponse.json(
        { error: `Invalid slots format for ${day}. Must be an array.` },
        { status: 400 }
      );
    }

    // Validate each slot
    for (const slot of slots) {
      const error = validateSlot(slot, day);
      if (error) return error;
    }

    // Validate no overlaps in the same day
    const overlapError = validateNoOverlaps(slots, day);
    if (overlapError) return overlapError;
  }

  return null;
}
