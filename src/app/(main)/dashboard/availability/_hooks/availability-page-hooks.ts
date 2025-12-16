/**
 * Custom hooks and helper functions for AvailabilityPage
 */

export interface AvailabilitySlot {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  meetingType: "online" | "offline";
  date?: string; // ISO date string (YYYY-MM-DD) - actual date in database
}

export interface AvailabilityByDay {
  [key: string]: AvailabilitySlot[];
}

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

/**
 * Initialize availability data from API response
 */
export function initializeAvailabilityData(data: {
  availabilities?: AvailabilityByDay;
}): AvailabilityByDay {
  const initialized: AvailabilityByDay = {};
  DAYS_OF_WEEK.forEach(day => {
    initialized[day.value] = data.availabilities?.[day.value] ?? [];
  });
  return initialized;
}

/**
 * Create empty availability data
 */
export function createEmptyAvailabilityData(): AvailabilityByDay {
  const empty: AvailabilityByDay = {};
  DAYS_OF_WEEK.forEach(day => {
    empty[day.value] = [];
  });
  return empty;
}

/**
 * Add slot to availability
 */
export function addSlotToAvailability(
  prev: AvailabilityByDay,
  dayOfWeek: string,
  date?: string
): AvailabilityByDay {
  return {
    ...prev,
    [dayOfWeek]: [
      ...(prev[dayOfWeek] || []),
      {
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
        meetingType: "online",
        date,
      },
    ],
  };
}

/**
 * Remove slot from availability
 */
export function removeSlotFromAvailability(
  prev: AvailabilityByDay,
  dayOfWeek: string,
  index: number
): AvailabilityByDay {
  return {
    ...prev,
    [dayOfWeek]: prev[dayOfWeek].filter((_, i) => i !== index),
  };
}

/**
 * Update slot in availability
 */
export function updateSlotInAvailability(
  prev: AvailabilityByDay,
  dayOfWeek: string,
  index: number,
  field: "startTime" | "endTime" | "meetingType",
  value: string
): AvailabilityByDay {
  return {
    ...prev,
    [dayOfWeek]: prev[dayOfWeek].map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    ),
  };
}
