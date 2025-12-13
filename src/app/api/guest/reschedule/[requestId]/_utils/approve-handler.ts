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
      title: string;
    };
  }
) {
  // Update appointment with new schedule
  await prisma.appointment.update({
    where: { id: rescheduleRequest.appointmentId },
    data: {
      date: rescheduleRequest.newDate,
      startTime: rescheduleRequest.newStartTime,
      endTime: rescheduleRequest.newEndTime,
      duration: calculateDuration(rescheduleRequest.newStartTime, rescheduleRequest.newEndTime),
      meetingLink: rescheduleRequest.newMeetingLink ?? undefined,
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
