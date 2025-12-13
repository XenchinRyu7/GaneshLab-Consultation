import { prisma } from "@/lib/prisma";

function calculateDuration(start: string, end: string): number {
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  const startTotal = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;
  return endTotal - startTotal;
}

export async function handleReject(
  rescheduleRequest: {
    id: string;
    appointmentId: string;
    appointment: {
      picId: string | null;
      guestName: string | null;
      title: string;
      status: string;
    };
  },
  alternativeDate: string,
  alternativeStartTime: string,
  alternativeEndTime: string,
  alternativeReason?: string
) {
  // Update reschedule request status to rejected
  await prisma.rescheduleRequest.update({
    where: { id: rescheduleRequest.id },
    data: { status: "rejected" },
  });

  // Update appointment with guest's proposed alternative schedule (directly move to new schedule)
  await prisma.appointment.update({
    where: { id: rescheduleRequest.appointmentId },
    data: {
      date: new Date(alternativeDate),
      startTime: alternativeStartTime,
      endTime: alternativeEndTime,
      duration: calculateDuration(alternativeStartTime, alternativeEndTime),
      status: "confirmed",
    },
  });

  // Send notification to PIC that guest rejected and proposed alternative (appointment already moved)
  if (rescheduleRequest.appointment.picId) {
    try {
      const reasonText = alternativeReason ? ` Reason: ${alternativeReason}.` : "";
      await prisma.notification.create({
        data: {
          userId: rescheduleRequest.appointment.picId,
          title: "Reschedule Request Rejected - Alternative Schedule Applied",
          message: `Guest ${rescheduleRequest.appointment.guestName} has rejected your reschedule request and proposed an alternative schedule. Appointment has been updated to: ${new Date(alternativeDate).toLocaleDateString("id-ID")} at ${alternativeStartTime}-${alternativeEndTime}.${reasonText}`,
          type: "APPOINTMENT",
          actionUrl: `/dashboard/appointment?id=${rescheduleRequest.appointmentId}`,
        },
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }
  }

  return null;
}
