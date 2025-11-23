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
  picId: string;
  picName: string;
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
  // Additional fields from API
  projectId?: string;
  projectName?: string;
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

// Project context - untuk menentukan apakah client bisa pilih semua PM atau hanya PM project
export interface ProjectContext {
  projectId?: string; // undefined = new project, bisa pilih semua PM
  projectName?: string;
  assignedPMId?: string; // untuk existing project, hanya PM ini yang bisa dipilih
}

// PIC interface for dropdown
export interface PIC {
  id: string;
  name: string;
  email: string;
}

// Reschedule request types
export type RescheduleStatus = "pending" | "approved" | "rejected" | "completed";

export interface RescheduleRequest {
  id: string;
  appointmentId: string;
  requestedById: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  reason?: string;
  status: RescheduleStatus;
  createdAt: string;
  updatedAt: string;
}
