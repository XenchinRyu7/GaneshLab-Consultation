/**
 * Generate available slots for GET /api/appointments/availability
 */

interface AvailabilitySlot {
  pmId: string;
  pmName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "online" | "offline";
  available: boolean;
}

interface PICAvailability {
  picId: string;
  date: Date;
  startTime: string;
  endTime: string;
  meetingType: "online" | "offline";
}

interface BlockedSlot {
  picId: string;
  date: Date;
  startTime: string;
  endTime: string;
}

interface Appointment {
  picId: string | null;
  date: Date;
  startTime: string;
  endTime: string;
}

/**
 * Check if slot is blocked
 */
function isSlotBlocked(
  picId: string,
  dateStr: string,
  slotStartTime: string,
  slotEndTime: string,
  blockedSlots: BlockedSlot[]
): boolean {
  return blockedSlots.some(
    blocked =>
      blocked.picId === picId &&
      blocked.date.toISOString().split("T")[0] === dateStr &&
      blocked.startTime < slotEndTime &&
      blocked.endTime > slotStartTime
  );
}

/**
 * Check if slot has appointment
 */
function hasAppointmentInSlot(
  picId: string,
  dateStr: string,
  slotStartTime: string,
  slotEndTime: string,
  appointments: Appointment[]
): boolean {
  return appointments.some(
    apt =>
      apt.picId === picId &&
      apt.date.toISOString().split("T")[0] === dateStr &&
      apt.startTime < slotEndTime &&
      apt.endTime > slotStartTime
  );
}

/**
 * Generate slots for a single day and PIC
 */
function generateSlotsForDayAndPIC(
  picId: string,
  dateStr: string,
  dayAvailabilities: PICAvailability[],
  blockedSlots: BlockedSlot[],
  appointments: Appointment[],
  picName: string
): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];

  for (const availability of dayAvailabilities) {
    const slotStartTime = availability.startTime;
    const slotEndTime = availability.endTime;

    const isBlocked = isSlotBlocked(picId, dateStr, slotStartTime, slotEndTime, blockedSlots);

    if (isBlocked) {
      continue;
    }

    const hasAppointment = hasAppointmentInSlot(
      picId,
      dateStr,
      slotStartTime,
      slotEndTime,
      appointments
    );

    slots.push({
      pmId: picId,
      pmName: picName,
      date: dateStr,
      startTime: slotStartTime,
      endTime: slotEndTime,
      type: availability.meetingType,
      available: !hasAppointment,
    });
  }

  return slots;
}

/**
 * Generate all available slots
 */
export function generateAvailableSlots(
  picIds: string[],
  days: number,
  start: Date,
  picAvailabilities: PICAvailability[],
  blockedSlots: BlockedSlot[],
  appointments: Appointment[],
  picMap: Map<string, string>
): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split("T")[0];

    for (const picId of picIds) {
      const dayAvailabilities = picAvailabilities.filter(
        avail => avail.picId === picId && avail.date.toISOString().split("T")[0] === dateStr
      );

      if (dayAvailabilities.length === 0) {
        continue;
      }

      const picName = picMap.get(picId) ?? "Unknown PIC";
      const daySlots = generateSlotsForDayAndPIC(
        picId,
        dateStr,
        dayAvailabilities,
        blockedSlots,
        appointments,
        picName
      );

      slots.push(...daySlots);
    }
  }

  // Sort slots by date, then by PIC, then by time
  slots.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.pmId !== b.pmId) return a.pmId.localeCompare(b.pmId);
    return a.startTime.localeCompare(b.startTime);
  });

  return slots;
}
