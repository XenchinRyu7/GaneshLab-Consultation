/**
 * Custom hooks and helper functions for CreateAppointmentDialog
 */

import type { PIC, ProjectContext, MeetingType } from "../_components/calendar-config";

interface PICResponse {
  id: string;
  fullname: string;
  email: string;
}

/**
 * Transform PIC response to PIC type
 */
function transformPICResponse(pic: PICResponse): PIC {
  return {
    id: pic.id,
    name: pic.fullname,
    email: pic.email,
  };
}

/**
 * Filter PICs by project context
 */
function filterPICsByProjectContext(pics: PIC[], projectContext?: ProjectContext): PIC[] {
  if (projectContext?.assignedPMId) {
    return pics.filter(pic => pic.id === projectContext.assignedPMId);
  }
  return pics;
}

/**
 * Auto-select PIC based on context
 */
function autoSelectPIC(
  pics: PIC[],
  projectContext: ProjectContext | undefined,
  setPmId: (id: string) => void
) {
  if (pics.length === 1) {
    setPmId(pics[0].id);
  } else if (projectContext?.assignedPMId) {
    setPmId(projectContext.assignedPMId);
  }
}

/**
 * Fetch and process PICs
 */
export async function fetchAndProcessPICs(
  projectContext: ProjectContext | undefined,
  setPics: (pics: PIC[]) => void,
  setPmId: (id: string) => void,
  setLoadingPics: (loading: boolean) => void
): Promise<void> {
  try {
    setLoadingPics(true);
    const response = await fetch("/api/projects/pics");
    if (!response.ok) {
      throw new Error("Failed to fetch PICs");
    }
    const data = await response.json();
    const fetchedPics: PIC[] = (data.pics ?? []).map(transformPICResponse);
    const filteredPics = filterPICsByProjectContext(fetchedPics, projectContext);
    setPics(filteredPics);
    autoSelectPIC(filteredPics, projectContext, setPmId);
  } catch (error) {
    console.error("Error fetching PICs:", error);
  } finally {
    setLoadingPics(false);
  }
}

/**
 * Initialize form from initial slot
 */
export function initializeFormFromSlot(
  initialSlot:
    | { pmId: string; date: string; startTime: string; endTime: string; type: MeetingType }
    | undefined,
  open: boolean,
  setters: {
    setPmId: (id: string) => void;
    setDate: (date: string) => void;
    setStartTime: (time: string) => void;
    setEndTime: (time: string) => void;
    setType: (type: MeetingType) => void;
    setTitle: (title: string) => void;
    setDescription: (desc: string) => void;
    setMeetingLink: (link: string) => void;
    setLocation: (location: string) => void;
  }
) {
  if (initialSlot && open) {
    setters.setPmId(initialSlot.pmId);
    setters.setDate(initialSlot.date);
    setters.setStartTime(initialSlot.startTime);
    setters.setEndTime(initialSlot.endTime);
    setters.setType(initialSlot.type);
    setters.setTitle("");
    setters.setDescription("");
    setters.setMeetingLink("");
    setters.setLocation("");
  } else if (open) {
    // Reset form
    setters.setTitle("");
    setters.setDescription("");
    setters.setPmId("");
    setters.setDate("");
    setters.setStartTime("");
    setters.setEndTime("");
    setters.setType("online");
    setters.setMeetingLink("");
    setters.setLocation("");
  }
}

/**
 * Calculate duration in minutes
 */
export function calculateDuration(start: string, end: string): number {
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  const startTotal = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;
  return endTotal - startTotal;
}

/**
 * Validate form submission
 */
export function validateFormSubmission(
  title: string,
  pmId: string,
  date: string,
  startTime: string,
  endTime: string,
  pics: PIC[]
): { valid: boolean; selectedPM: PIC | null } {
  if (!title.trim() || !pmId || !date || !startTime || !endTime) {
    return { valid: false, selectedPM: null };
  }

  const selectedPM = pics.find(pm => pm.id === pmId);
  if (!selectedPM) {
    return { valid: false, selectedPM: null };
  }

  return { valid: true, selectedPM };
}

/**
 * Build appointment payload
 */
export function buildAppointmentPayload(
  title: string,
  description: string,
  pmId: string,
  selectedPM: PIC,
  date: string,
  startTime: string,
  endTime: string,
  duration: number,
  type: MeetingType,
  meetingLink: string,
  location: string,
  projectContext?: ProjectContext
) {
  return {
    title: title.trim(),
    description: description.trim() || undefined,
    clientId: "", // Will be set by parent component
    clientName: "", // Will be set by parent component
    pmId,
    pmName: selectedPM.name,
    date,
    startTime,
    endTime,
    duration,
    type,
    meetingLink: type === "online" ? meetingLink.trim() || undefined : undefined,
    location: type === "offline" ? location.trim() || undefined : undefined,
    status: "pending" as const,
    projectId: projectContext?.projectId,
  };
}
