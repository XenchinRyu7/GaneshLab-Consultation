import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publishNotificationDelete } from "@/lib/realtime";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();

    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isRead } = await request.json();

    const result = await prisma.notification.updateMany({
      where: {
        id: id,
        userId: session.id,
      },
      data: {
        isRead,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Middleware will handle broadcast automatically
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATION_PATCH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch read state before deletion
    const exists = await prisma.notification.findFirst({
      where: { id, userId: session.id },
      select: { isRead: true },
    });

    const result = await prisma.notification.deleteMany({
      where: {
        id: id,
        userId: session.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Broadcast delete (best-effort)
    try {
      await publishNotificationDelete(session.id, id, exists ? !exists.isRead : false);
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATION_DELETE]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
