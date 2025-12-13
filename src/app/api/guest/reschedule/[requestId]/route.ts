import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { handleApprove } from "./_utils/approve-handler";
import { handleReject } from "./_utils/reject-handler";

/**
 * GET /api/guest/reschedule/[requestId] - Get reschedule request details (public, no auth required)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;

    const rescheduleRequest = await prisma.rescheduleRequest.findUnique({
      where: { id: requestId },
      include: {
        appointment: {
          include: {
            pic: {
              select: {
                fullname: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!rescheduleRequest) {
      return NextResponse.json({ error: "Reschedule request not found" }, { status: 404 });
    }

    // Verify this is a guest appointment
    if (!rescheduleRequest.appointment.isGuestAppointment) {
      return NextResponse.json(
        { error: "This endpoint is only for guest appointments" },
        { status: 403 }
      );
    }

    // Return safe data (no sensitive info)
    return NextResponse.json({
      id: rescheduleRequest.id,
      appointment: {
        id: rescheduleRequest.appointment.id,
        title: rescheduleRequest.appointment.title,
        date: rescheduleRequest.appointment.date.toISOString(),
        startTime: rescheduleRequest.appointment.startTime,
        endTime: rescheduleRequest.appointment.endTime,
        type: rescheduleRequest.appointment.type,
        meetingLink: rescheduleRequest.appointment.meetingLink,
        location: rescheduleRequest.appointment.location,
        guestName: rescheduleRequest.appointment.guestName,
        guestEmail: rescheduleRequest.appointment.guestEmail,
        pic: rescheduleRequest.appointment.pic,
      },
      newDate: rescheduleRequest.newDate.toISOString(),
      newStartTime: rescheduleRequest.newStartTime,
      newEndTime: rescheduleRequest.newEndTime,
      newMeetingLink: rescheduleRequest.newMeetingLink,
      reason: rescheduleRequest.reason,
      status: rescheduleRequest.status,
    });
  } catch (error) {
    console.error("Error fetching reschedule request:", error);
    return NextResponse.json({ error: "Failed to fetch reschedule request" }, { status: 500 });
  }
}

/**
 * PATCH /api/guest/reschedule/[requestId] - Approve or reject reschedule request (public, no auth required)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const body = await req.json();
    const { action, alternativeDate, alternativeStartTime, alternativeEndTime, alternativeReason } =
      body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Reject REQUIRES alternative schedule - guest must propose alternative date/time
    if (action === "reject") {
      if (!alternativeDate || !alternativeStartTime || !alternativeEndTime) {
        return NextResponse.json(
          {
            error:
              "Alternative schedule is required when rejecting. Please provide alternative date, start time, and end time.",
          },
          { status: 400 }
        );
      }
    }

    // Get reschedule request with appointment
    const rescheduleRequest = await prisma.rescheduleRequest.findUnique({
      where: { id: requestId },
      include: {
        appointment: {
          include: {
            pic: {
              select: {
                id: true,
                fullname: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!rescheduleRequest) {
      return NextResponse.json({ error: "Reschedule request not found" }, { status: 404 });
    }

    // Verify this is a guest appointment
    if (!rescheduleRequest.appointment.isGuestAppointment) {
      return NextResponse.json(
        { error: "This endpoint is only for guest appointments" },
        { status: 403 }
      );
    }

    // Check if request is still pending
    if (rescheduleRequest.status !== "pending") {
      return NextResponse.json({ error: "Request has already been processed" }, { status: 400 });
    }

    if (action === "approve") {
      await handleApprove(requestId, {
        appointmentId: rescheduleRequest.appointmentId,
        newDate: rescheduleRequest.newDate,
        newStartTime: rescheduleRequest.newStartTime,
        newEndTime: rescheduleRequest.newEndTime,
        newMeetingLink: rescheduleRequest.newMeetingLink,
        appointment: {
          picId: rescheduleRequest.appointment.picId,
          guestName: rescheduleRequest.appointment.guestName,
          guestEmail: rescheduleRequest.appointment.guestEmail,
          title: rescheduleRequest.appointment.title,
          type: rescheduleRequest.appointment.type as "online" | "offline",
          clientId: rescheduleRequest.appointment.clientId,
        },
      });

      return NextResponse.json({
        message: "Reschedule request approved",
        status: "completed",
      });
    } else {
      // At this point, alternativeDate, alternativeStartTime, and alternativeEndTime are guaranteed to exist
      // because we validated them earlier
      await handleReject(
        {
          id: requestId,
          appointmentId: rescheduleRequest.appointmentId,
          appointment: {
            picId: rescheduleRequest.appointment.picId,
            guestName: rescheduleRequest.appointment.guestName,
            guestEmail: rescheduleRequest.appointment.guestEmail,
            title: rescheduleRequest.appointment.title,
            status: rescheduleRequest.appointment.status,
            type: rescheduleRequest.appointment.type as "online" | "offline",
          },
        },
        alternativeDate,
        alternativeStartTime,
        alternativeEndTime,
        alternativeReason
      );

      return NextResponse.json({
        message:
          "Reschedule request rejected. Appointment has been updated with your proposed alternative schedule.",
        status: "rejected",
      });
    }
  } catch (error) {
    console.error("Error processing reschedule request:", error);
    return NextResponse.json({ error: "Failed to process reschedule request" }, { status: 500 });
  }
}
