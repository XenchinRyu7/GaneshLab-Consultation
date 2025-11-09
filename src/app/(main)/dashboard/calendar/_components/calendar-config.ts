export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type MeetingType = "online" | "offline";

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  clientName: string;
  pmId: string;
  pmName: string;
  date: string; // ISO date string
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  duration: number; // minutes
  type: MeetingType;
  meetingLink?: string; // untuk online
  location?: string; // untuk offline
  status: AppointmentStatus;
  notes?: string; // hasil meeting
  createdAt: string;
  updatedAt: string;
}

export interface PMAvailability {
  pmId: string;
  pmName: string;
  workingHours: {
    [dayOfWeek: string]: {
      // "monday", "tuesday", etc
      start: string; // "09:00"
      end: string; // "17:00"
      available: boolean;
    };
  };
  blockedSlots: Array<{
    date: string; // ISO date string
    startTime: string;
    endTime: string;
    reason?: string;
  }>;
}

// Mock data untuk development - 10 PM
export const mockPMs = [
  { id: "pm-1", name: "John PM", email: "john@ganeshlab.com" },
  { id: "pm-2", name: "Jane PM", email: "jane@ganeshlab.com" },
  { id: "pm-3", name: "Bob PM", email: "bob@ganeshlab.com" },
  { id: "pm-4", name: "Alice PM", email: "alice@ganeshlab.com" },
  { id: "pm-5", name: "Charlie PM", email: "charlie@ganeshlab.com" },
  { id: "pm-6", name: "Diana PM", email: "diana@ganeshlab.com" },
  { id: "pm-7", name: "Eve PM", email: "eve@ganeshlab.com" },
  { id: "pm-8", name: "Frank PM", email: "frank@ganeshlab.com" },
  { id: "pm-9", name: "Grace PM", email: "grace@ganeshlab.com" },
  { id: "pm-10", name: "Henry PM", email: "henry@ganeshlab.com" },
];

// Generate availability slots for PMs (free slots in a month)
export interface PMAvailabilitySlot {
  pmId: string;
  pmName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: MeetingType; // online or offline
  available: boolean;
}

// Helper to format time string
function formatTime(hour: number, minute: number = 0): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

// Generate mock availability for all PMs for the next 30 days
// More realistic: 08:00-17:00 WIB, dengan pattern online/offline per waktu
export function generatePMAvailability(
  startDate: Date = new Date(),
  days: number = 30
): PMAvailabilitySlot[] {
  const availability: PMAvailabilitySlot[] = [];
  const slotSet = new Set<string>(); // Untuk prevent duplicate

  // Working hours: 08:00 - 17:00 WIB
  const WORK_START_HOUR = 8;
  const WORK_END_HOUR = 17;
  const SLOT_DURATION = 60; // 1 hour per slot

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Skip weekends (optional, bisa diubah)
    // if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Generate availability for each PM
    for (const pm of mockPMs) {
      // Generate 5-10 slots per PM per month (randomly distributed)
      // Untuk 30 hari, berarti sekitar 0.17-0.33 slot per hari
      // Kita generate dengan probability yang lebih tinggi untuk dapat 5-10 slot per bulan
      // Target: ~0.2-0.33 slot per hari = 6-10 slot per 30 hari
      const slotsPerDay = Math.random() < 0.3 ? 1 : 0; // 30% chance ada slot per hari
      
      if (slotsPerDay === 0) continue; // Skip hari ini untuk PM ini

      // Pattern: 08:00-12:00 biasanya online, 13:00-17:00 biasanya offline
      // Tapi bisa juga random
      const morningType: MeetingType = Math.random() > 0.3 ? "online" : "offline";
      const afternoonType: MeetingType = Math.random() > 0.3 ? "offline" : "online";

      // Generate 1 slot per hari (kadang 2 untuk variasi)
      const numSlots = Math.random() > 0.7 ? 2 : 1; // 30% chance 2 slots

      for (let slotIdx = 0; slotIdx < numSlots; slotIdx++) {
        // Random start hour antara 08:00 - 16:00 (karena slot 1 jam, max sampai 16:00)
        const startHour = WORK_START_HOUR + Math.floor(Math.random() * (WORK_END_HOUR - WORK_START_HOUR - 1));
        const startMinute = Math.random() > 0.5 ? 0 : 30; // 00 atau 30
        const startTime = formatTime(startHour, startMinute);

        // End time = start time + 1 hour
        let endHour = startHour;
        let endMinute = startMinute + SLOT_DURATION;
        if (endMinute >= 60) {
          endHour += 1;
          endMinute -= 60;
        }
        const endTime = formatTime(endHour, endMinute);

        // Pastikan tidak melebihi jam kerja
        if (endHour > WORK_END_HOUR || (endHour === WORK_END_HOUR && endMinute > 0)) {
          continue;
        }

        // Determine type based on time
        let type: MeetingType;
        if (startHour < 12) {
          // Morning: mostly online
          type = morningType;
        } else if (startHour >= 13) {
          // Afternoon: mostly offline
          type = afternoonType;
        } else {
          // 12:00-13:00: random
          type = Math.random() > 0.5 ? "online" : "offline";
        }

        // Create unique key untuk prevent duplicate
        const slotKey = `${pm.id}-${dateStr}-${startTime}-${endTime}`;
        if (slotSet.has(slotKey)) continue;
        slotSet.add(slotKey);

        availability.push({
          pmId: pm.id,
          pmName: pm.name,
          date: dateStr,
          startTime,
          endTime,
          type,
          available: true,
        });
      }
    }
  }

  // Sort by date, then by PM, then by time
  availability.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.pmId !== b.pmId) return a.pmId.localeCompare(b.pmId);
    return a.startTime.localeCompare(b.startTime);
  });

  return availability;
}

export const mockAppointments: Appointment[] = [
  {
    id: "apt-1",
    title: "Project Kickoff Meeting",
    description: "Initial discussion about project requirements",
    clientId: "client-1",
    clientName: "Client ABC",
    pmId: "pm-1",
    pmName: "John PM",
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "11:00",
    duration: 60,
    type: "online",
    meetingLink: "https://meet.google.com/abc-def-ghi",
    status: "confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Project context - untuk menentukan apakah client bisa pilih semua PM atau hanya PM project
export interface ProjectContext {
  projectId?: string; // undefined = new project, bisa pilih semua PM
  projectName?: string;
  assignedPMId?: string; // untuk existing project, hanya PM ini yang bisa dipilih
}

