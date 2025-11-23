/**
 * GET /api/appointments/reschedule - Get reschedule requests for a client
 * PATCH /api/appointments/reschedule/[id] - Approve or reject reschedule request
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/appointments/reschedule?clientId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 });
    }

    // Verify user is the client
    const user = await getCurrentUser();
    if (!user || user.id !== clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const requests = await prisma.rescheduleRequest.findMany({
      where: {
        appointment: {
          clientId,
        },
      },
      include: {
        appointment: {
          select: {
            title: true,
            pic: {
              select: {
                fullname: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching reschedule requests:", error);
    return NextResponse.json({ error: "Failed to fetch reschedule requests" }, { status: 500 });
  }
}
