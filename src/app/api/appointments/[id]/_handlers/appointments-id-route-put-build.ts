/**
 * Build update data for PUT /api/appointments/[id]
 */

interface UpdateAppointmentBody {
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  type?: "online" | "offline";
  status?: string;
  notes?: string;
  meetingLink?: string | null;
  location?: string | null;
}

/**
 * Build basic appointment fields
 */
function buildBasicFields(body: UpdateAppointmentBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.startTime !== undefined) data.startTime = body.startTime;
  if (body.endTime !== undefined) data.endTime = body.endTime;
  if (body.duration !== undefined) data.duration = body.duration;
  if (body.type !== undefined) data.type = body.type;
  if (body.status !== undefined) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes;
  return data;
}

/**
 * Handle meeting link and location based on type
 */
function handleMeetingFields(body: UpdateAppointmentBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  if (body.type === "online") {
    data.meetingLink = body.meetingLink ?? null;
    data.location = null;
  } else if (body.type === "offline") {
    data.location = body.location ?? null;
    data.meetingLink = null;
  } else {
    if (body.meetingLink !== undefined) {
      data.meetingLink = body.meetingLink;
    }
    if (body.location !== undefined) {
      data.location = body.location;
    }
  }

  return data;
}

/**
 * Build complete update data object
 */
export function buildAppointmentUpdateData(body: UpdateAppointmentBody): Record<string, unknown> {
  return {
    ...buildBasicFields(body),
    ...handleMeetingFields(body),
  };
}
