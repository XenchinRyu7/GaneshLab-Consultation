/**
 * POST /api/appointments/[id]/reschedule - Request reschedule for an appointment
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import transporter from "@/lib/email";
import { createCalendarEventWithMeet } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

interface RescheduleRequest {
  newDate: string;
  newStartTime: string;
  newEndTime: string;
}

async function handleCalendarEvent(appointment: any, body: RescheduleRequest) {
  if (appointment.type !== "online") return null;

  const pic = await prisma.userProfile.findUnique({
    where: { id: appointment.picId },
    select: {
      id: true,
      googleAccessToken: true,
      googleRefreshToken: true,
      googleTokenExpiry: true,
    },
  });

  if (!pic?.googleAccessToken || !appointment.client) return null;

  const [startHour, startMin] = body.newStartTime.split(":").map(Number);
  const [endHour, endMin] = body.newEndTime.split(":").map(Number);

  const startDate = new Date(body.newDate);
  startDate.setHours(startHour, startMin, 0, 0);

  const endDate = new Date(body.newDate);
  endDate.setHours(endHour, endMin, 0, 0);

  const calendarEvent = await createCalendarEventWithMeet(pic, {
    summary: `${appointment.title} (Rescheduled)`,
    description: appointment.description ?? "",
    start: startDate,
    end: endDate,
    attendees: [appointment.client.email],
    type: "online",
  });

  return calendarEvent?.meetLink ?? null;
}

async function validateRescheduleRequest(
  appointmentId: string,
  userId: string,
  isGuestAppointment: boolean
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      client: true,
      pic: true,
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.picId !== userId) {
    throw new Error("Only PIC can request reschedule");
  }

  if (!isGuestAppointment) {
    const existingRequest = await prisma.rescheduleRequest.findFirst({
      where: {
        appointmentId: appointmentId,
        status: "pending",
      },
    });

    if (existingRequest) {
      throw new Error("Reschedule request already pending");
    }
  }

  return appointment;
}

async function createNewMeetingLink(appointment: any, body: RescheduleRequest) {
  if (appointment.type !== "online" || !appointment.client) {
    return null;
  }

  const pic = await prisma.userProfile.findUnique({
    where: { id: appointment.picId },
    select: {
      id: true,
      googleAccessToken: true,
      googleRefreshToken: true,
      googleTokenExpiry: true,
    },
  });

  if (!pic?.googleAccessToken) {
    return null;
  }

  const [startHour, startMin] = body.newStartTime.split(":").map(Number);
  const [endHour, endMin] = body.newEndTime.split(":").map(Number);

  const startDate = new Date(body.newDate);
  startDate.setHours(startHour, startMin, 0, 0);

  const endDate = new Date(body.newDate);
  endDate.setHours(endHour, endMin, 0, 0);

  const calendarEvent = await createCalendarEventWithMeet(pic, {
    summary: `${appointment.title} (Rescheduled)`,
    description: appointment.description ?? "",
    start: startDate,
    end: endDate,
    attendees: [appointment.client.email],
    type: "online",
  });

  return calendarEvent?.meetLink ?? null;
}

async function sendRescheduleNotification(appointment: any, body: RescheduleRequest) {
  if (appointment.isGuestAppointment && appointment.guestEmail) {
    const rescheduleEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Appointment Reschedule Requested</h2>
        <p>Dear ${appointment.guestName},</p>
        <p>Your assigned PIC has requested to reschedule your appointment.</p>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3>Current Appointment:</h3>
          <p><strong>Title:</strong> ${appointment.title}</p>
          <p><strong>Original Date:</strong> ${appointment.date.toLocaleDateString()}</p>
          <p><strong>Original Time:</strong> ${appointment.startTime} - ${appointment.endTime}</p>

          <h3 style="margin-top: 15px;">Proposed New Schedule:</h3>
          <p><strong>New Date:</strong> ${new Date(body.newDate).toLocaleDateString()}</p>
          <p><strong>New Time:</strong> ${body.newStartTime} - ${body.newEndTime}</p>
        </div>

        <p>Please contact this email to confirm the reschedule request. You will receive a notification once the reschedule is confirmed.</p>
        <p>If you have any concerns, please contact your PIC at <strong>${appointment.pic?.email}</strong> or our team.</p>

        <p>Best regards,<br>GaneshLab Consultation Team</p>
      </div>
    `;

    const mailOptions = {
      from: `"GaneshLab Consultation" <${process.env.SMTP_USER}>`,
      to: appointment.guestEmail,
      subject: "Appointment Reschedule Requested - GaneshLab Consultation",
      html: rescheduleEmailHtml,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Reschedule request email sent to guest:", appointment.guestEmail);
    } catch (emailError) {
      console.error("Failed to send reschedule email:", emailError);
    }
  } else if (appointment.clientId) {
    try {
      await prisma.notification.create({
        data: {
          userId: appointment.clientId,
          title: "Appointment Reschedule Requested",
          message: `Your PIC ${appointment.pic?.fullname} has requested to reschedule your appointment "${appointment.title}" to ${new Date(body.newDate).toLocaleDateString()} at ${body.newStartTime}`,
          type: "APPOINTMENT",
          actionUrl: `/dashboard/appointment?id=${appointment.id}`,
        },
      });
    } catch (notifError) {
      console.error("Error creating reschedule notification:", notifError);
    }
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: appointmentId } = await params;
    const body: RescheduleRequest = await req.json();

    if (!body.newDate || !body.newStartTime || !body.newEndTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const appointment = await validateRescheduleRequest(appointmentId, user.id, false);
    const newMeetingLink = await createNewMeetingLink(appointment, body);

    const rescheduleRequest = await prisma.rescheduleRequest.create({
      data: {
        appointmentId: appointmentId,
        requestedById: user.id,
        newDate: new Date(body.newDate),
        newStartTime: body.newStartTime,
        newEndTime: body.newEndTime,
        newMeetingLink: newMeetingLink,
        status: "pending",
      },
    });

    await sendRescheduleNotification(appointment, body);

    return NextResponse.json({
      message: "Reschedule request created successfully",
      rescheduleRequest,
    });
  } catch (error) {
    console.error("Error creating reschedule request:", error);
    if (error instanceof Error) {
      if (error.message === "Appointment not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Only PIC can request reschedule") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message === "Reschedule request already pending") {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Failed to create reschedule request" }, { status: 500 });
  }
}
