import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/appointments/[id] - Get a single appointment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        pic: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Format appointment
    const formattedAppointment = {
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      clientId: appointment.clientId,
      clientName: appointment.client.fullname,
      picId: appointment.picId,
      pmId: appointment.picId,
      pmName: appointment.pic.fullname,
      picName: appointment.pic.fullname,
      projectId: appointment.projectId,
      projectName: appointment.project?.name,
      date: appointment.date.toISOString().split("T")[0],
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      duration: appointment.duration,
      type: appointment.type,
      meetingLink: appointment.meetingLink,
      location: appointment.location,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };

    return NextResponse.json({ appointment: formattedAppointment }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/appointments/[id] - Update an appointment
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.startTime !== undefined) updateData.startTime = body.startTime;
    if (body.endTime !== undefined) updateData.endTime = body.endTime;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Handle meeting link and location based on type
    if (body.type === "online") {
      updateData.meetingLink = body.meetingLink || null;
      updateData.location = null;
    } else if (body.type === "offline") {
      updateData.location = body.location || null;
      updateData.meetingLink = null;
    } else if (body.meetingLink !== undefined) {
      updateData.meetingLink = body.meetingLink;
    } else if (body.location !== undefined) {
      updateData.location = body.location;
    }

    // If time or date changed, check for conflicts
    if (body.date || body.startTime || body.endTime) {
      const picId = body.picId || existingAppointment.picId;
      const date = body.date ? new Date(body.date) : existingAppointment.date;
      const startTime = body.startTime || existingAppointment.startTime;
      const endTime = body.endTime || existingAppointment.endTime;

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          picId,
          date,
          id: {
            not: id, // Exclude current appointment
          },
          status: {
            not: "cancelled",
          },
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
      });

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: "PIC is not available at this time. Another appointment exists." },
          { status: 400 }
        );
      }
    }

    // Update appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        pic: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Format appointment
    const formattedAppointment = {
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      clientId: appointment.clientId,
      clientName: appointment.client.fullname,
      picId: appointment.picId,
      pmId: appointment.picId,
      pmName: appointment.pic.fullname,
      picName: appointment.pic.fullname,
      projectId: appointment.projectId,
      projectName: appointment.project?.name,
      date: appointment.date.toISOString().split("T")[0],
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      duration: appointment.duration,
      type: appointment.type,
      meetingLink: appointment.meetingLink,
      location: appointment.location,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };

    return NextResponse.json({ appointment: formattedAppointment }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating appointment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/appointments/[id] - Delete an appointment (soft delete by setting status to cancelled)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Soft delete by setting status to cancelled
    await prisma.appointment.update({
      where: { id },
      data: {
        status: "cancelled",
      },
    });

    return NextResponse.json({ message: "Appointment cancelled successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

