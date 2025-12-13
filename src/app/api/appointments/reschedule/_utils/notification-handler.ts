import transporter from "@/lib/email";
import { prisma } from "@/lib/prisma";

import { generateRescheduleEmailHtml } from "./email-templates";

interface SendNotificationParams {
  appointment: {
    isGuestAppointment: boolean;
    guestEmail?: string | null;
    guestName?: string | null;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    clientId?: string | null;
    pic?: {
      fullname?: string | null;
      email?: string | null;
    } | null;
  };
  proposedDate: string;
  proposedStartTime: string;
  proposedEndTime: string;
  reason?: string;
  rescheduleRequestId?: string;
}

export async function sendRescheduleNotification(params: SendNotificationParams) {
  const {
    appointment,
    proposedDate,
    proposedStartTime,
    proposedEndTime,
    reason,
    rescheduleRequestId,
  } = params;

  if (appointment.isGuestAppointment && appointment.guestEmail && rescheduleRequestId) {
    const emailHtml = generateRescheduleEmailHtml({
      guestName: appointment.guestName ?? "Guest",
      title: appointment.title,
      currentDate: appointment.date,
      currentStartTime: appointment.startTime,
      currentEndTime: appointment.endTime,
      proposedDate,
      proposedStartTime,
      proposedEndTime,
      reason,
      rescheduleRequestId,
      picEmail: appointment.pic?.email ?? undefined,
    });

    const mailOptions = {
      from: `"GaneshLab Consultation" <${process.env.SMTP_USER}>`,
      to: appointment.guestEmail,
      subject: "Appointment Reschedule Requested - GaneshLab Consultation",
      html: emailHtml,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Reschedule request email sent to guest:", appointment.guestEmail);
    } catch (emailError) {
      console.error("Failed to send reschedule email:", emailError);
    }
  }

  if (appointment.clientId && !appointment.isGuestAppointment) {
    try {
      await prisma.notification.create({
        data: {
          userId: appointment.clientId,
          title: "Appointment Reschedule Requested",
          message: `Your PIC ${appointment.pic?.fullname} has requested to reschedule your appointment "${appointment.title}" to ${new Date(proposedDate).toLocaleDateString()} at ${proposedStartTime}`,
          type: "APPOINTMENT",
          actionUrl: `/dashboard/appointment?id=${appointment.clientId}`,
        },
      });
    } catch (notifError) {
      console.error("Error creating reschedule notification:", notifError);
    }
  }
}
