import transporter from "@/lib/email";
import { createCalendarEventWithMeet } from "@/lib/google-calendar";
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
      guestEmail: string | null;
      title: string;
      status: string;
      type: "online" | "offline";
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

  // Auto-generate meeting link if online
  let meetingLink: string | null = null;
  if (
    rescheduleRequest.appointment.type === "online" &&
    rescheduleRequest.appointment.picId &&
    rescheduleRequest.appointment.guestEmail
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
        const [startHour, startMin] = alternativeStartTime.split(":").map(Number);
        const [endHour, endMin] = alternativeEndTime.split(":").map(Number);

        const startDate = new Date(alternativeDate);
        startDate.setHours(startHour, startMin, 0, 0);

        const endDate = new Date(alternativeDate);
        endDate.setHours(endHour, endMin, 0, 0);

        const calendarEvent = await createCalendarEventWithMeet(pic, {
          summary: `${rescheduleRequest.appointment.title} (Guest Alternative Schedule)`,
          description: `Guest proposed alternative schedule after rejecting reschedule request.${alternativeReason ? `\nReason: ${alternativeReason}` : ""}`,
          start: startDate,
          end: endDate,
          attendees: [rescheduleRequest.appointment.guestEmail],
          type: "online",
        });

        meetingLink = calendarEvent?.meetLink ?? null;
      }
    } catch (error) {
      console.error("Error generating meeting link:", error);
      // Continue without meeting link - admin can add it later
    }
  }

  // Update appointment with guest's proposed alternative schedule
  // Status is "pending" - admin needs to approve
  await prisma.appointment.update({
    where: { id: rescheduleRequest.appointmentId },
    data: {
      date: new Date(alternativeDate),
      startTime: alternativeStartTime,
      endTime: alternativeEndTime,
      duration: calculateDuration(alternativeStartTime, alternativeEndTime),
      status: "pending", // Admin needs to approve the alternative schedule
      meetingLink: meetingLink ?? undefined,
    },
  });

  // Send notification to PIC that guest rejected and proposed alternative (pending admin approval)
  if (rescheduleRequest.appointment.picId) {
    try {
      const reasonText = alternativeReason ? ` Reason: ${alternativeReason}.` : "";
      const meetingLinkText = meetingLink
        ? ` Meeting link has been auto-generated: ${meetingLink}`
        : "";
      await prisma.notification.create({
        data: {
          userId: rescheduleRequest.appointment.picId,
          title: "Reschedule Request Rejected - Alternative Schedule Proposed",
          message: `Guest ${rescheduleRequest.appointment.guestName} has rejected your reschedule request and proposed an alternative schedule: ${new Date(alternativeDate).toLocaleDateString("id-ID")} at ${alternativeStartTime}-${alternativeEndTime}.${meetingLinkText}${reasonText} Please review and approve the alternative schedule.`,
          type: "APPOINTMENT",
          actionUrl: `/dashboard/appointment?id=${rescheduleRequest.appointmentId}`,
        },
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }
  }

  // Send email to guest confirming their alternative schedule proposal
  if (rescheduleRequest.appointment.guestEmail) {
    try {
      const meetingLinkSection = meetingLink
        ? `
          <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px;">Meeting Link:</h3>
            <p style="margin: 0; color: #1e40af;">
              <a href="${meetingLink}" style="color: #2563eb; text-decoration: underline; word-break: break-all;">${meetingLink}</a>
            </p>
            <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px;">
              You will also receive a calendar invite from Google Calendar with this meeting link.
            </p>
          </div>
        `
        : "";

      const alternativeScheduleEmailHtml = `
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
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Alternative Schedule Proposed</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 32px;">
                      <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">Dear <strong>${rescheduleRequest.appointment.guestName}</strong>,</p>
                      <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">Thank you for proposing an alternative schedule. Your proposal has been received and is pending admin approval.</p>

                      <!-- Proposed Schedule Card -->
                      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 16px 0; color: #92400e; font-size: 18px; font-weight: 600;">Your Proposed Schedule</h3>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 8px 0; color: #78350f; font-size: 14px;"><strong style="color: #92400e;">Date:</strong> ${new Date(alternativeDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #78350f; font-size: 14px;"><strong style="color: #92400e;">Time:</strong> ${alternativeStartTime} - ${alternativeEndTime}</td>
                          </tr>
                          ${alternativeReason ? `<tr><td style="padding: 8px 0; color: #78350f; font-size: 14px;"><strong style="color: #92400e;">Reason:</strong> ${alternativeReason}</td></tr>` : ""}
                        </table>
                      </div>

                      ${meetingLinkSection}

                      <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
                          <strong>Note:</strong> Your proposed schedule is currently pending admin approval. You will be notified once it has been reviewed.
                        </p>
                      </div>

                      <!-- Contact Info -->
                      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 32px; text-align: center;">
                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                          If you have any questions, please contact your PIC or our support team.
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
        to: rescheduleRequest.appointment.guestEmail,
        subject: "Alternative Schedule Proposed - GaneshLab Consultation",
        html: alternativeScheduleEmailHtml,
      };

      await transporter.sendMail(mailOptions);
      console.log(
        "Alternative schedule email sent to guest:",
        rescheduleRequest.appointment.guestEmail
      );
    } catch (emailError) {
      console.error("Failed to send alternative schedule email to guest:", emailError);
      // Don't fail the reject process if email fails
    }
  }

  return null;
}
