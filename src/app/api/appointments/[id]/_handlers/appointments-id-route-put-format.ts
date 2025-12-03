/**
 * Format appointment response
 */

/**
 * Format appointment for response
 */
export function formatAppointment(appointment: {
  id: string;
  title: string;
  description: string | null;
  clientId: string | null;
  picId: string | null;
  projectId: string | null;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  type: "online" | "offline";
  meetingLink: string | null;
  location: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  client: {
    fullname: string;
  } | null;
  pic: {
    fullname: string;
  } | null;
  project: {
    name: string;
  } | null;
}) {
  return {
    id: appointment.id,
    title: appointment.title,
    description: appointment.description,
    clientId: appointment.clientId,
    clientName: appointment.client?.fullname ?? null,
    picId: appointment.picId,
    pmId: appointment.picId,
    pmName: appointment.pic?.fullname ?? null,
    picName: appointment.pic?.fullname ?? null,
    projectId: appointment.projectId,
    projectName: appointment.project?.name ?? null,
    date: appointment.date.toISOString().split("T")[0],
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    duration: appointment.duration,
    type: appointment.type,
    meetingLink: appointment.meetingLink,
    location: appointment.location,
    status: appointment.status,
    notes: appointment.notes,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  };
}
