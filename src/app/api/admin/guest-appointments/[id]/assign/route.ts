import { NextRequest, NextResponse } from "next/server";

import { logAudit, getRequestInfo } from "@/lib/audit-logger";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    });

    if (!pic || pic.role !== "pic") {
      return NextResponse.json({ error: "Invalid PIC" }, { status: 400 });
    }

    // Verify appointment exists and is a guest appointment
    const appointment = (await prisma.appointment.findUnique({
      where: { id },
    })) as { isGuestAppointment?: boolean; guestName?: string; guestEmail?: string } | null;

    if (!appointment?.isGuestAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Update appointment with PIC
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        picId,
        status: "confirmed", // Auto-confirm when PIC is assigned
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
