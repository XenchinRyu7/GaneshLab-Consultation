/**
 * POST /api/appointments/[id]/reschedule - Request reschedule for an appointment
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import transporter from "@/lib/email";
import { createCalendarEventWithMeet } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/utils";

interface RescheduleRequest {
  newDate: string;
  newStartTime: string;
  newEndTime: string;
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
  if (appointment.type !== "online") {
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

  // Include client email or guest email as attendee
  const attendees: string[] = [];
  if (appointment.client?.email) {
    attendees.push(appointment.client.email);
  }
  if (appointment.isGuestAppointment && appointment.guestEmail) {
    attendees.push(appointment.guestEmail);
  }

  if (attendees.length === 0) {
    return null;
  }

  const calendarEvent = await createCalendarEventWithMeet(pic, {
    summary: `${appointment.title} (Rescheduled)`,
    description: appointment.description ?? "",
    start: startDate,
    end: endDate,
    attendees: attendees,
    type: "online",
  });

  return calendarEvent?.meetLink ?? null;
}

async function sendRescheduleNotification(
  appointment: any,
  body: RescheduleRequest,
  rescheduleRequestId?: string
) {
  if (appointment.isGuestAppointment && appointment.guestEmail) {
    if (!rescheduleRequestId) {
      console.error("rescheduleRequestId is required for guest appointment email");
      return;
    }

    // Use getBaseUrl() which uses NEXT_PUBLIC_BASE_URL from .env
    const baseUrl = getBaseUrl();
    const approveUrl = `${baseUrl}/guest/reschedule/${rescheduleRequestId}?action=approve`;
    const rejectUrl = `${baseUrl}/guest/reschedule/${rescheduleRequestId}?action=reject`;
    const viewUrl = `${baseUrl}/guest/reschedule/${rescheduleRequestId}`;

    const rescheduleEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Appointment Reschedule Request</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 32px;">
                    <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">Dear <strong>${appointment.guestName}</strong>,</p>
                    <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">Your assigned PIC has requested to reschedule your appointment. Please review the details below and respond accordingly.</p>

                    <!-- Current Appointment Card -->
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                      <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                        <span style="display: inline-block; width: 4px; height: 20px; background-color: #6366f1; border-radius: 2px; margin-right: 12px;"></span>
                        Current Appointment
                      </h3>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 8px 0; color: #374151; font-size: 14px;"><strong style="color: #111827;">Title:</strong> ${appointment.title}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #374151; font-size: 14px;"><strong style="color: #111827;">Date:</strong> ${appointment.date.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #374151; font-size: 14px;"><strong style="color: #111827;">Time:</strong> ${appointment.startTime} - ${appointment.endTime}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Proposed Schedule Card -->
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                      <h3 style="margin: 0 0 16px 0; color: #92400e; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                        <span style="display: inline-block; width: 4px; height: 20px; background-color: #f59e0b; border-radius: 2px; margin-right: 12px;"></span>
                        Proposed New Schedule
                      </h3>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 8px 0; color: #78350f; font-size: 14px;"><strong style="color: #92400e;">New Date:</strong> ${new Date(body.newDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #78350f; font-size: 14px;"><strong style="color: #92400e;">New Time:</strong> ${body.newStartTime} - ${body.newEndTime}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Action Buttons -->
                    <div style="text-align: center; margin: 32px 0;">
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 15px; font-weight: 600;">Please click one of the buttons below to respond:</p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding-bottom: 12px;">
                            <a href="${approveUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">✓ Approve Request</a>
                          </td>
                        </tr>
                        <tr>
                          <td align="center">
                            <a href="${rejectUrl}" style="display: inline-block; padding: 14px 32px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);">✗ Reject Request</a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 24px 0 0 0; font-size: 13px; color: #9ca3af;">
                        Or visit this link: <a href="${viewUrl}" style="color: #3b82f6; text-decoration: underline;">${viewUrl}</a>
                      </p>
                    </div>

                    <!-- Contact Info -->
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 32px; text-align: center;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If you have any questions or concerns, please contact your PIC at <strong style="color: #374151;">${appointment.pic?.email}</strong> or our support team.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 13px;">Best regards,<br><strong style="color: #374151;">GaneshLab Consultation Team</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
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

    await sendRescheduleNotification(appointment, body, rescheduleRequest.id);

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
