import { NextRequest, NextResponse } from "next/server";

import { logAudit, getRequestInfo } from "@/lib/audit-logger";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/appointments/guest - Create guest appointment
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      guestName,
      guestEmail,
      guestPhone,
      guestOrganization,
      title,
      guestPurpose,
      date,
      duration,
      type,
      preferredTime,
    } = body;

    // Validation
    if (
      !guestName ||
      !guestEmail ||
      !guestPhone ||
      !title ||
      !guestPurpose ||
      !date ||
      !preferredTime
    ) {
      return NextResponse.json({ error: "Semua field wajib harus diisi" }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
    }

    // Calculate end time based on preferred time and duration
    const [hours, minutes] = preferredTime.split(":").map(Number);
    const startTimeMinutes = hours * 60 + minutes;
    const endTimeMinutes = startTimeMinutes + parseInt(duration);

    const endHours = Math.floor(endTimeMinutes / 60);
    const endMinutes = endTimeMinutes % 60;
    const endTime = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;

    // Create guest appointment
    const appointment = await prisma.appointment.create({
      data: {
        title,
        description: guestPurpose,
        isGuestAppointment: true,
        guestName,
        guestEmail,
        guestPhone,
        guestOrganization,
        guestPurpose,
        date: new Date(date),
        startTime: preferredTime,
        endTime: endTime,
        duration: parseInt(duration),
        type: type as "online" | "offline",
        status: "pending",
        // clientId and picId will be null for guest appointments initially
      } as never,
    });

    // Send notifications to all admin and PIC users
    try {
      const adminUsers = await prisma.userProfile.findMany({
        where: { role: { in: ["admin", "pic"] } },
        select: { id: true, fullname: true },
      });

      for (const admin of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: "New Guest Appointment Request",
            message: `New guest appointment from ${guestName} for "${title}" on ${new Date(date).toLocaleDateString("id-ID")}`,
            type: "APPOINTMENT",
            actionUrl: `/dashboard/admin/guest-appointments`,
          },
        });
      }
    } catch (notifError) {
      console.error("Error creating guest appointment notification:", notifError);
      // Don't fail the main operation if notification fails
    }

    // Log audit
    const requestInfo = getRequestInfo(req.headers);
    await logAudit({
      action: "CREATE_GUEST_APPOINTMENT",
      entityType: "APPOINTMENT",
      entityId: appointment.id,
      details: {
        guestName,
        guestEmail,
        title,
        date: date,
        type,
      },
      ...requestInfo,
    });

    return NextResponse.json({
      message: "Permintaan janji temu berhasil dikirim",
      appointment: {
        id: appointment.id,
        title: appointment.title,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
      },
    });
  } catch (error) {
    console.error("Error creating guest appointment:", error);

    // Log failed audit
    const requestInfo = getRequestInfo(req.headers);
    await logAudit({
      action: "CREATE_GUEST_APPOINTMENT",
      entityType: "APPOINTMENT",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      ...requestInfo,
    });

    return NextResponse.json({ error: "Gagal membuat janji temu" }, { status: 500 });
  }
}
