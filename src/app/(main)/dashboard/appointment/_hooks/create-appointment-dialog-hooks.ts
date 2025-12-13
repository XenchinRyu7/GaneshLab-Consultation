/**
 * Custom hooks and helper functions for CreateAppointmentDialog
 */

import type { PIC, ProjectContext, MeetingType } from "../_components/calendar-config";

interface Project {
  id: string;
  name: string;
}

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
  setPicId: (id: string) => void
) {
  if (pics.length === 1) {
    setPicId(pics[0].id);
  } else if (projectContext?.assignedPMId) {
    setPicId(projectContext.assignedPMId);
  }
}

/**
 * Fetch client projects
 */
export async function fetchClientProjects(
  userId: string,
  userRole: string,
  setProjects: (projects: Project[]) => void,
  setLoadingProjects: (loading: boolean) => void
): Promise<void> {
  try {
    setLoadingProjects(true);
    const response = await fetch(`/api/projects?userId=${userId}&role=${userRole}`);
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    const data = await response.json();
    const projects: Project[] = (data.projects ?? []).map((project: any) => ({
      id: project.id,
      name: project.name,
    }));
    setProjects(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
  } finally {
    setLoadingProjects(false);
  }
}
export async function fetchAndProcessPICs(
  projectContext: ProjectContext | undefined,
  setPics: (pics: PIC[]) => void,
  setPicId: (id: string) => void,
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
    autoSelectPIC(filteredPics, projectContext, setPicId);
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
    setPicId: (id: string) => void;
    setDate: (date: string) => void;
    setStartTime: (time: string) => void;
    setEndTime: (time: string) => void;
    setType: (type: MeetingType) => void;
    setTitle: (title: string) => void;
    setDescription: (desc: string) => void;
    setLocation: (location: string) => void;
    setProjectId?: (id: string) => void;
  }
) {
  if (initialSlot && open) {
    setters.setPicId(initialSlot.pmId);
    setters.setDate(initialSlot.date);
    setters.setStartTime(initialSlot.startTime);
    setters.setEndTime(initialSlot.endTime);
    setters.setType(initialSlot.type);
    setters.setTitle("");
    setters.setDescription("");
    setters.setLocation("");
  } else if (open) {
    // Reset form
    setters.setTitle("");
    setters.setDescription("");
    setters.setPicId("");
    setters.setDate("");
    setters.setStartTime("");
    setters.setEndTime("");
    setters.setType("online");
    setters.setLocation("");
    setters.setProjectId?.("");
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
  picId: string,
  projectId: string,
  date: string,
  startTime: string,
  endTime: string,
  pics: PIC[],
  isClient: boolean = false
): { valid: boolean; selectedPM: PIC | null } {
  if (!title.trim() || !picId || !date || !startTime || !endTime) {
    return { valid: false, selectedPM: null };
  }

  // For clients, project selection is required
  if (isClient && !projectId) {
    return { valid: false, selectedPM: null };
  }

  const selectedPM = pics.find(pm => pm.id === picId);
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
  picId: string,
  projectId: string,
  selectedPM: PIC,
  date: string,
  startTime: string,
  endTime: string,
  duration: number,
  type: MeetingType,
  location: string
) {
  return {
    title: title.trim(),
    description: description.trim() || undefined,
    clientId: "", // Will be set by parent component
    clientName: "", // Will be set by parent component
    pmId: picId,
    pmName: selectedPM.name,
    picId,
    picName: selectedPM.name,
    date,
    startTime,
    endTime,
    duration,
    type,
    location: type === "offline" ? location.trim() || undefined : undefined,
    status: "pending" as const,
    projectId: projectId || undefined,
  };
}
