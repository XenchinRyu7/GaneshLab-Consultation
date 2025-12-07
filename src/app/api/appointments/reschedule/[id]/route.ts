/**
 * PATCH /api/appointments/reschedule/[id] - Approve or reject reschedule request
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RescheduleAction {
  action: "approve" | "reject";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: requestId } = await params;
    const body: RescheduleAction = await req.json();

    if (!body.action || !["approve", "reject"].includes(body.action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get reschedule request with appointment
    const rescheduleRequest = await prisma.rescheduleRequest.findUnique({
      where: { id: requestId },
      include: {
        appointment: true,
      },
    });

    if (!rescheduleRequest) {
      return NextResponse.json({ error: "Reschedule request not found" }, { status: 404 });
    }

    // Verify user is the client of the appointment
    if (rescheduleRequest.appointment.clientId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if request is still pending
    if (rescheduleRequest.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    const newStatus = body.action === "approve" ? "approved" : "rejected";

    if (body.action === "approve") {
      // Update appointment with new schedule AND new meeting link
      await prisma.appointment.update({
        where: { id: rescheduleRequest.appointmentId },
        data: {
          date: rescheduleRequest.newDate,
          startTime: rescheduleRequest.newStartTime,
          endTime: rescheduleRequest.newEndTime,
          duration: calculateDuration(rescheduleRequest.newStartTime, rescheduleRequest.newEndTime),
          meetingLink: rescheduleRequest.newMeetingLink, // Apply new meeting link
        },
      });

      // Update reschedule request status
      await prisma.rescheduleRequest.update({
        where: { id: requestId },
        data: { status: "completed" },
      });
    } else {
      // Just update reschedule request status to rejected
      await prisma.rescheduleRequest.update({
        where: { id: requestId },
        data: { status: newStatus },
      });
    }

    // Send notification to the requester
    try {
      const notificationType = body.action === "approve" ? "SUCCESS" : "ERROR";
      const statusText = body.action === "approve" ? "Approved" : "Rejected";

      await prisma.notification.create({
        data: {
          userId: rescheduleRequest.requestedById,
          title: `Reschedule Request ${statusText}`,
          message: `Your reschedule request has been ${statusText.toLowerCase()}`,
          type: notificationType,
          actionUrl: `/dashboard/appointment`,
        },
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Don't fail the request
    }

    return NextResponse.json({
      message: `Reschedule request ${newStatus}`,
      status: body.action === "approve" ? "completed" : newStatus,
    });
  } catch (error) {
    console.error("Error processing reschedule request:", error);
    return NextResponse.json({ error: "Failed to process reschedule request" }, { status: 500 });
  }
}

function calculateDuration(start: string, end: string): number {
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  const startTotal = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;
  return endTotal - startTotal;
}
