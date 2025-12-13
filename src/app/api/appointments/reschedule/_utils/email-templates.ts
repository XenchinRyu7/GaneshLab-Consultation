import { getBaseUrl } from "@/lib/utils";

interface EmailParams {
  guestName: string;
  title: string;
  currentDate: Date;
  currentStartTime: string;
  currentEndTime: string;
  proposedDate: string;
  proposedStartTime: string;
  proposedEndTime: string;
  reason?: string;
  rescheduleRequestId: string;
  picEmail?: string;
}

export function generateRescheduleEmailHtml(params: EmailParams): string {
  const {
    guestName,
    title,
    currentDate,
    currentStartTime,
    currentEndTime,
    proposedDate,
    proposedStartTime,
    proposedEndTime,
    reason,
    rescheduleRequestId,
    picEmail,
  } = params;

  const baseUrl = getBaseUrl();
  const approveUrl = `${baseUrl}/guest/reschedule/${rescheduleRequestId}?action=approve`;
  const rejectUrl = `${baseUrl}/guest/reschedule/${rescheduleRequestId}?action=reject`;
  const viewUrl = `${baseUrl}/guest/reschedule/${rescheduleRequestId}`;

  return `
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
                  <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">Dear <strong>${guestName}</strong>,</p>
                  <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 15px; line-height: 1.6;">Your assigned PIC has requested to reschedule your appointment. Please review the details below and respond accordingly.</p>

                  <!-- Current Appointment Card -->
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                      <span style="display: inline-block; width: 4px; height: 20px; background-color: #6366f1; border-radius: 2px; margin-right: 12px;"></span>
                      Current Appointment
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-size: 14px;"><strong style="color: #111827;">Title:</strong> ${title}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-size: 14px;"><strong style="color: #111827;">Date:</strong> ${currentDate.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #374151; font-size: 14px;"><strong style="color: #111827;">Time:</strong> ${currentStartTime} - ${currentEndTime}</td>
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
                        <td style="padding: 8px 0; color: #78350f; font-size: 14px;"><strong style="color: #92400e;">New Date:</strong> ${new Date(proposedDate).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #78350f; font-size: 14px;"><strong style="color: #92400e;">New Time:</strong> ${proposedStartTime} - ${proposedEndTime}</td>
                      </tr>
                      ${reason ? `<tr><td style="padding: 12px 0 0 0; color: #78350f; font-size: 14px;"><strong style="color: #92400e;">Reason:</strong> ${reason}</td></tr>` : ""}
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
                      If you have any questions or concerns, please contact your PIC at <strong style="color: #374151;">${picEmail ?? "our support team"}</strong> or our support team.
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
}
