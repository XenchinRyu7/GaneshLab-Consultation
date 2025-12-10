import { NextRequest, NextResponse } from "next/server";

import { logAudit, getRequestInfo } from "@/lib/audit-logger";
import { auth } from "@/lib/auth";
import transporter from "@/lib/email";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/guest-appointments/[id]/approve - Approve guest appointment
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

    // Update appointment status to confirmed
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: "confirmed",
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

    // Send approval email to guest
    if (appointment.guestEmail) {
      const approvalEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Appointment Approved</h2>
          <p>Dear ${appointment.guestName},</p>
          <p>Your guest appointment request has been <strong>approved</strong>.</p>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Appointment Details:</h3>
            <p><strong>Title:</strong> ${appointment.title}</p>
            <p><strong>Date:</strong> ${appointment.date.toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
            ${appointment.pic ? `<p><strong>Assigned PIC:</strong> ${appointment.pic.fullname}</p>` : ""}
          </div>

          <p>You will receive further communication regarding the meeting details.</p>

          <p>Best regards,<br>GaneshLab Consultation Team</p>
        </div>
      `;

      const mailOptions = {
        from: `"GaneshLab Consultation" <${process.env.SMTP_USER}>`,
        to: appointment.guestEmail,
        subject: "Appointment Approved - GaneshLab Consultation",
        html: approvalEmailHtml,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log("Approval email sent to:", appointment.guestEmail);
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
        // Don't fail the approval if email fails
      }
    }

    // Log audit
    const requestInfo = getRequestInfo(req.headers);
    await logAudit({
      userId: session.id,
      action: "APPROVE_GUEST_APPOINTMENT",
      entityType: "APPOINTMENT",
      entityId: id,
      details: {
        guestName: appointment.guestName ?? "Unknown",
        guestEmail: appointment.guestEmail ?? "Unknown",
      },
      ...requestInfo,
    });

    return NextResponse.json({
      message: "Guest appointment approved successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error approving guest appointment:", error);

    const requestInfo = getRequestInfo(req.headers);
    await logAudit({
      action: "APPROVE_GUEST_APPOINTMENT",
      entityType: "APPOINTMENT",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      ...requestInfo,
    });

    return NextResponse.json({ error: "Failed to approve guest appointment" }, { status: 500 });
  }
}
