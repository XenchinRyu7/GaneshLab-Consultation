import { createCalendarEventWithMeet } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

function calculateDuration(start: string, end: string): number {
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  const startTotal = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;
  return endTotal - startTotal;
}

export async function handleApprove(
  rescheduleRequestId: string,
  rescheduleRequest: {
    appointmentId: string;
    newDate: Date;
    newStartTime: string;
    newEndTime: string;
    newMeetingLink: string | null;
    appointment: {
      picId: string | null;
      guestName: string | null;
      guestEmail: string | null;
      title: string;
      type: "online" | "offline";
      clientId: string | null;
    };
  }
) {
  // Get full appointment data to check for client email
  const appointment = await prisma.appointment.findUnique({
    where: { id: rescheduleRequest.appointmentId },
    include: {
      client: {
        select: {
          email: true,
        },
      },
    },
  });

  // If meeting link doesn't exist and appointment is online, create calendar event
  let finalMeetingLink = rescheduleRequest.newMeetingLink;
  if (
    !finalMeetingLink &&
    rescheduleRequest.appointment.type === "online" &&
    rescheduleRequest.appointment.picId
  ) {
    try {
      const pic = await prisma.userProfile.findUnique({
        where: { id: rescheduleRequest.appointment.picId },
        select: {
          id: true,
          googleAccessToken: true,
          googleRefreshToken: true,
          googleTokenExpiry: true,
        },
      });

      if (pic?.googleAccessToken) {
        const [startHour, startMin] = rescheduleRequest.newStartTime.split(":").map(Number);
        const [endHour, endMin] = rescheduleRequest.newEndTime.split(":").map(Number);

        const startDate = new Date(rescheduleRequest.newDate);
        startDate.setHours(startHour, startMin, 0, 0);

        const endDate = new Date(rescheduleRequest.newDate);
        endDate.setHours(endHour, endMin, 0, 0);

        // Include client email or guest email as attendee
        const attendees: string[] = [];
        if (appointment?.client?.email) {
          attendees.push(appointment.client.email);
        }
        if (rescheduleRequest.appointment.guestEmail) {
          attendees.push(rescheduleRequest.appointment.guestEmail);
        }

        if (attendees.length > 0) {
          const calendarEvent = await createCalendarEventWithMeet(pic, {
            summary: `${rescheduleRequest.appointment.title} (Rescheduled - Approved)`,
            description: `Appointment reschedule has been approved.${appointment?.description ? `\n\n${appointment.description}` : ""}`,
            start: startDate,
            end: endDate,
            attendees: attendees,
            type: "online",
          });

          finalMeetingLink = calendarEvent?.meetLink ?? null;
          // sendUpdates: "all" in createCalendarEventWithMeet will automatically send email to all attendees
        }
      }
    } catch (error) {
      console.error("Error creating calendar event on approve:", error);
      // Continue without meeting link
    }
  }

  // Update appointment with new schedule and set status to confirmed
  await prisma.appointment.update({
    where: { id: rescheduleRequest.appointmentId },
    data: {
      date: rescheduleRequest.newDate,
      startTime: rescheduleRequest.newStartTime,
      endTime: rescheduleRequest.newEndTime,
      duration: calculateDuration(rescheduleRequest.newStartTime, rescheduleRequest.newEndTime),
      meetingLink: finalMeetingLink ?? undefined,
      status: "confirmed", // Guest approve = appointment langsung confirmed
    },
  });

  // Update reschedule request status to completed
  await prisma.rescheduleRequest.update({
    where: { id: rescheduleRequestId },
    data: { status: "completed" },
  });

  // Send notification to PIC
  if (rescheduleRequest.appointment.picId) {
    try {
      await prisma.notification.create({
        data: {
          userId: rescheduleRequest.appointment.picId,
          title: "Reschedule Request Approved",
          message: `Guest ${rescheduleRequest.appointment.guestName} has approved the reschedule request for "${rescheduleRequest.appointment.title}"`,
          type: "SUCCESS",
          actionUrl: `/dashboard/appointment?id=${rescheduleRequest.appointmentId}`,
        },
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }
  }
}
