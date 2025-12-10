import { NextRequest, NextResponse } from "next/server";

import { logAudit, getRequestInfo } from "@/lib/audit-logger";
import { auth } from "@/lib/auth";
import transporter from "@/lib/email";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/guest-appointments/[id]/reject - Reject guest appointment
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { reason } = await req.json();

    // Verify appointment exists and is a guest appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        pic: {
          select: {
            fullname: true,
            email: true,
          },
        },
      },
    });

    if (!appointment?.isGuestAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.status !== "pending") {
      return NextResponse.json({ error: "Appointment is not in pending status" }, { status: 400 });
    }

    // Update appointment status to cancelled
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: "cancelled",
      },
      include: {
        pic: {
          select: {
            fullname: true,
            email: true,
          },
        },
      },
    });

    // Send rejection email to guest
    if (appointment.guestEmail) {
      const rejectionEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Appointment Rejected</h2>
          <p>Dear ${appointment.guestName},</p>
          <p>We regret to inform you that your guest appointment request has been <strong>rejected</strong>.</p>

          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3>Appointment Details:</h3>
            <p><strong>Title:</strong> ${appointment.title}</p>
            <p><strong>Date:</strong> ${appointment.date?.toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          </div>

          <p>If you have any questions or would like to schedule a different time, please contact us.</p>

          <p>Best regards,<br>GaneshLab Consultation Team</p>
        </div>
      `;

      const mailOptions = {
        from: `"GaneshLab Consultation" <${process.env.SMTP_USER}>`,
        to: appointment.guestEmail,
        subject: "Appointment Rejected - GaneshLab Consultation",
        html: rejectionEmailHtml,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Rejection email sent to:", appointment.guestEmail);
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
        // Don't fail the rejection if email fails
      }
    }

    // Log audit
    const requestInfo = getRequestInfo(req.headers);
    await logAudit({
      userId: session.id,
      action: "REJECT_GUEST_APPOINTMENT",
      entityType: "APPOINTMENT",
      entityId: id,
      details: {
        guestName: appointment.guestName ?? "Unknown",
        guestEmail: appointment.guestEmail ?? "Unknown",
        reason: reason ?? "No reason provided",
      },
      ...requestInfo,
    });

    return NextResponse.json({
      message: "Guest appointment rejected successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error rejecting guest appointment:", error);

    const requestInfo = getRequestInfo(req.headers);
    await logAudit({
      action: "REJECT_GUEST_APPOINTMENT",
      entityType: "APPOINTMENT",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      ...requestInfo,
    });

    return NextResponse.json({ error: "Failed to reject guest appointment" }, { status: 500 });
  }
}
