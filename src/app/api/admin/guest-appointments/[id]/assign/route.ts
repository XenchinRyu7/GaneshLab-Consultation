import { NextRequest, NextResponse } from "next/server";

import { logAudit, getRequestInfo } from "@/lib/audit-logger";
import { auth } from "@/lib/auth";
import transporter from "@/lib/email";
import { createCalendarEventWithMeet } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

async function createMeetingLinkForAppointment(
  appointment: {
    type: string;
    date: Date;
    startTime: string;
    endTime: string;
    title: string;
    guestName: string | null;
    guestPurpose: string | null;
    description: string | null;
    guestEmail: string | null;
  },
  pic: {
    id: string;
    googleAccessToken: string | null;
    googleRefreshToken: string | null;
    googleTokenExpiry: Date | null;
  }
): Promise<string | null> {
  if (appointment.type !== "online" || !pic.googleAccessToken || !appointment.guestEmail) {
    return null;
  }

  try {
    const [startHour, startMin] = appointment.startTime.split(":").map(Number);
    const [endHour, endMin] = appointment.endTime.split(":").map(Number);

    const startDate = new Date(appointment.date);
    startDate.setHours(startHour, startMin, 0, 0);

    const endDate = new Date(appointment.date);
    endDate.setHours(endHour, endMin, 0, 0);

    const calendarEvent = await createCalendarEventWithMeet(
      {
        id: pic.id,
        googleAccessToken: pic.googleAccessToken,
        googleRefreshToken: pic.googleRefreshToken,
        googleTokenExpiry: pic.googleTokenExpiry,
      },
      {
        summary: `Appointment: ${appointment.title}`,
        description: `Guest: ${appointment.guestName}${appointment.guestPurpose ? `\nPurpose: ${appointment.guestPurpose}` : ""}${appointment.description ? `\n\n${appointment.description}` : ""}`,
        start: startDate,
        end: endDate,
        attendees: [appointment.guestEmail],
        type: "online",
      }
    );

    return calendarEvent?.meetLink ?? null;
  } catch (error) {
    console.error("Error creating calendar event on assign PIC:", error);
    return null;
  }
}

async function sendAssignmentEmailToPIC(
  pic: { fullname: string; email: string },
  appointment: {
    title: string;
    guestName: string | null;
    guestEmail: string | null;
    guestPhone: string | null;
    guestPurpose: string | null;
    date: Date;
    startTime: string;
    endTime: string;
    type: string;
  }
): Promise<void> {
  if (!pic.email) {
    return;
  }

  const assignmentEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">New Guest Appointment Assigned</h2>
      <p>Dear ${pic.fullname},</p>
      <p>You have been assigned to handle a guest appointment.</p>

      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Appointment Details:</h3>
        <p><strong>Title:</strong> ${appointment.title}</p>
        <p><strong>Guest:</strong> ${appointment.guestName}</p>
        <p><strong>Email:</strong> ${appointment.guestEmail}</p>
        <p><strong>Phone:</strong> ${appointment.guestPhone}</p>
        <p><strong>Purpose:</strong> ${appointment.guestPurpose}</p>
        <p><strong>Date:</strong> ${appointment.date.toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
        <p><strong>Type:</strong> ${appointment.type}</p>
      </div>

      <p>Please prepare for this appointment and contact the guest if needed.</p>
      <p>If you cannot attend this appointment, please request a reschedule through the system.</p>

      <p>Best regards,<br>GaneshLab Consultation Team</p>
    </div>
  `;

  const mailOptions = {
    from: `"GaneshLab Consultation" <${process.env.SMTP_USER}>`,
    to: pic.email,
    subject: "New Guest Appointment Assigned - GaneshLab Consultation",
    html: assignmentEmailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Assignment email sent to PIC:", pic.email);
  } catch (emailError) {
    console.error("Failed to send assignment email:", emailError);
    // Don't fail the assignment if email fails
  }
}

/**
 * POST /api/admin/guest-appointments/[id]/assign - Assign PIC to guest appointment
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[assign-pic] User role:", session.role);

    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { picId } = await req.json();

    if (!picId) {
      return NextResponse.json({ error: "PIC ID is required" }, { status: 400 });
    }

    // Verify PIC exists and has correct role
    const pic = await prisma.userProfile.findUnique({
      where: { id: picId },
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!pic || pic.role !== "pic") {
      return NextResponse.json({ error: "Invalid PIC" }, { status: 400 });
    }

    // Verify appointment exists and is a guest appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment?.isGuestAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Create Google Calendar event with meeting link if appointment is online
    const meetingLink = await createMeetingLinkForAppointment(appointment, pic);

    // Update appointment with PIC and meeting link
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        picId,
        status: "confirmed", // Auto-confirm when PIC is assigned
        meetingLink: meetingLink ?? undefined,
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

    // Send assignment email to PIC
    await sendAssignmentEmailToPIC(pic, appointment);

    // Log audit
    const requestInfo = getRequestInfo(req.headers);
    await logAudit({
      userId: session.id,
      action: "ASSIGN_PIC_TO_GUEST",
      entityType: "APPOINTMENT",
      entityId: id,
      details: {
        picId,
        picName: pic.fullname,
        guestName: appointment.guestName ?? "Unknown",
        guestEmail: appointment.guestEmail ?? "Unknown",
      },
      ...requestInfo,
    });

    return NextResponse.json({
      message: "PIC assigned successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error assigning PIC:", error);

    const requestInfo = getRequestInfo(req.headers);
    await logAudit({
      action: "ASSIGN_PIC_TO_GUEST",
      entityType: "APPOINTMENT",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      ...requestInfo,
    });

    return NextResponse.json({ error: "Failed to assign PIC" }, { status: 500 });
  }
}
