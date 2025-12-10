import { NextRequest, NextResponse } from "next/server";

import { logAudit, getRequestInfo } from "@/lib/audit-logger";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/admin/guest-appointments/[id] - Delete guest appointment
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    });

    if (!appointment?.isGuestAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Store appointment details for audit log before deletion
    const appointmentDetails = {
      guestName: appointment.guestName ?? "Unknown",
      guestEmail: appointment.guestEmail ?? "Unknown",
      title: appointment.title,
      date: appointment.date?.toISOString(),
      status: appointment.status,
    };

    // Delete the appointment
    await prisma.appointment.delete({
      where: { id },
    });

    // Log audit
    const requestInfo = getRequestInfo(req.headers);
    await logAudit({
      userId: session.id,
      action: "DELETE_GUEST_APPOINTMENT",
      entityType: "APPOINTMENT",
      entityId: id,
      details: appointmentDetails,
      ...requestInfo,
    });

    return NextResponse.json({
      message: "Guest appointment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting guest appointment:", error);

    const requestInfo = getRequestInfo(req.headers);
    await logAudit({
      action: "DELETE_GUEST_APPOINTMENT",
      entityType: "APPOINTMENT",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      ...requestInfo,
    });

    return NextResponse.json({ error: "Failed to delete guest appointment" }, { status: 500 });
  }
}
