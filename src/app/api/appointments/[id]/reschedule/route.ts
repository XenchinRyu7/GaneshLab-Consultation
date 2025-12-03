/**
 * POST /api/appointments/[id]/reschedule - Request reschedule for an appointment
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { createCalendarEventWithMeet } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

interface RescheduleRequest {
  newDate: string;
  newStartTime: string;
  newEndTime: string;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: appointmentId } = await params;
    const body: RescheduleRequest = await req.json();

    // Validate required fields
    if (!body.newDate || !body.newStartTime || !body.newEndTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get appointment and verify PIC access
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        pic: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Only PIC can request reschedule
    if (appointment.picId !== user.id) {
      return NextResponse.json({ error: "Only PIC can request reschedule" }, { status: 403 });
    }

    // Check if there's already a pending reschedule request
    const existingRequest = await prisma.rescheduleRequest.findFirst({
      where: {
        appointmentId: appointmentId,
        status: "pending",
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: "Reschedule request already pending" }, { status: 400 });
    }

    let newMeetingLink: string | null = null;

    // Generate new Google Meet link for online appointments
    if (appointment.type === "online") {
      const pic = await prisma.userProfile.findUnique({
        where: { id: appointment.picId },
        select: {
          id: true,
          googleAccessToken: true,
          googleRefreshToken: true,
          googleTokenExpiry: true,
        },
      });

      if (pic?.googleAccessToken && appointment.client) {
        const [startHour, startMin] = body.newStartTime.split(":").map(Number);
        const [endHour, endMin] = body.newEndTime.split(":").map(Number);

        const startDate = new Date(body.newDate);
        startDate.setHours(startHour, startMin, 0, 0);

        const endDate = new Date(body.newDate);
        endDate.setHours(endHour, endMin, 0, 0);

        const calendarEvent = await createCalendarEventWithMeet(pic, {
          summary: `${appointment.title} (Rescheduled)`,
          description: appointment.description ?? "",
          start: startDate,
          end: endDate,
          attendees: [appointment.client.email],
          type: "online",
        });

        if (calendarEvent?.meetLink) {
          newMeetingLink = calendarEvent.meetLink;
        }
      }
    }

    // Create reschedule request
    const rescheduleRequest = await prisma.rescheduleRequest.create({
      data: {
        appointmentId: appointmentId,
        requestedById: user.id,
        newDate: new Date(body.newDate),
        newStartTime: body.newStartTime,
        newEndTime: body.newEndTime,
        newMeetingLink: newMeetingLink,
        status: "pending",
      },
    });

    // TODO: Send notification to client

    return NextResponse.json({
      message: "Reschedule request created successfully",
      rescheduleRequest,
    });
  } catch (error) {
    console.error("Error creating reschedule request:", error);
    return NextResponse.json({ error: "Failed to create reschedule request" }, { status: 500 });
  }
}
