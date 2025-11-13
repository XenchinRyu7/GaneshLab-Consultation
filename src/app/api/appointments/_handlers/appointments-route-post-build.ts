/**
 * Build appointment data for POST /api/appointments
 */

import type { Prisma } from "@prisma/client";

interface CreateAppointmentBody {
  title: string;
  description?: string | null;
  clientId: string;
  picId: string;
  projectId?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: "online" | "offline";
  meetingLink?: string | null;
  location?: string | null;
}

/**
 * Build appointment data object
 */
export function buildAppointmentData(
  body: CreateAppointmentBody
): Prisma.AppointmentUncheckedCreateInput {
  return {
    title: body.title,
    description: body.description ?? null,
    clientId: body.clientId,
    picId: body.picId,
    projectId: body.projectId ?? null,
    date: new Date(body.date),
    startTime: body.startTime,
    endTime: body.endTime,
    duration: body.duration,
    type: body.type,
    meetingLink: body.type === "online" ? (body.meetingLink ?? null) : null,
    location: body.type === "offline" ? (body.location ?? null) : null,
    status: "pending",
  };
}
