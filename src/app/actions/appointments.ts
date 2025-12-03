"use server";

import { revalidatePath } from "next/cache";

import { buildAppointmentData } from "@/app/api/appointments/_handlers/appointments-route-post-build";
import { getCurrentUser } from "@/lib/auth";
import { createCalendarEvent } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

function extractFormData(formData: FormData) {
  return {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    clientId: formData.get("clientId") as string,
    picId: formData.get("picId") as string,
    projectId: formData.get("projectId") as string,
    date: formData.get("date") as string,
    startTime: formData.get("startTime") as string,
    endTime: formData.get("endTime") as string,
    duration: parseInt(formData.get("duration") as string),
    type: formData.get("type") as "online" | "offline",
    meetingLink: formData.get("meetingLink") as string,
    location: formData.get("location") as string,
  };
}

function validateFormData(data: ReturnType<typeof extractFormData>) {
  if (
    !data.title ||
    !data.clientId ||
    !data.picId ||
    !data.date ||
    !data.startTime ||
    !data.endTime
  ) {
    throw new Error("Missing required fields");
  }

  const startDateTime = new Date(`${data.date}T${data.startTime}`);
  const endDateTime = new Date(`${data.date}T${data.endTime}`);

  if (startDateTime >= endDateTime) {
    throw new Error("End time must be after start time");
  }

  return { startDateTime, endDateTime };
}

async function createCalendarEventForAppointment(appointment: {
  title: string;
  description: string | null;
  client: { email: string; fullname: string };
  picId: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: "online" | "offline";
  meetingLink: string | null;
  location: string | null;
}) {
  try {
    const calendarEvent = {
      summary: `Appointment: ${appointment.title}`,
      description: `Meeting with ${appointment.client.fullname}\n\n${appointment.description ?? ""}\n\nType: ${appointment.type}\n${appointment.type === "online" ? `Meeting Link: ${appointment.meetingLink}` : `Location: ${appointment.location}`}`,
      start: new Date(`${appointment.date}T${appointment.startTime}`),
      end: new Date(`${appointment.date}T${appointment.endTime}`),
      attendees: [appointment.client.email],
      location: appointment.location ?? undefined,
    };

    await createCalendarEvent(appointment.picId, calendarEvent);
  } catch (calendarError) {
    console.error("Failed to create calendar event:", calendarError);
  }
}

export async function createAppointment(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    const data = extractFormData(formData);
    validateFormData(data);

    const appointmentData = buildAppointmentData({
      title: data.title,
      description: data.description,
      clientId: data.clientId,
      picId: data.picId,
      projectId: data.projectId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      type: data.type,
      meetingLink: data.meetingLink,
      location: data.location,
    });

    const appointment = await prisma.appointment.create({
      data: appointmentData,
      include: {
        client: { select: { email: true, fullname: true } },
        pic: { select: { email: true, fullname: true } },
      },
    });

    // Only create calendar event if client and pic exist (non-guest appointments)
    if (appointment.client && appointment.pic && appointment.picId) {
      await createCalendarEventForAppointment({
        title: appointment.title,
        description: appointment.description,
        client: appointment.client,
        picId: appointment.picId,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        type: appointment.type,
        meetingLink: appointment.meetingLink,
        location: appointment.location,
      });
    }

    revalidatePath("/appointments");
    revalidatePath("/dashboard");

    return { success: true, appointment };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create appointment",
    };
  }
}
