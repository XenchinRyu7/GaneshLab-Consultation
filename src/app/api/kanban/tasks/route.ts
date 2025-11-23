/**
 * POST /api/kanban/tasks - Create a new task/card
 * PATCH /api/kanban/tasks/[id]/move - Move task to different board or position
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Create a new task
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, boardId, priority, assigneeId, tags, dueDate, estimatedHours } =
      body;

    if (!title || !boardId) {
      return NextResponse.json({ error: "Title and boardId required" }, { status: 400 });
    }

    // Verify board exists and user has access
    const board = await prisma.kanbanBoard.findUnique({
      where: { id: boardId },
      include: { project: true },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Verify user has access to project
    if (board.project.clientId !== user.id && board.project.picId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get max position in this board
    const maxTask = await prisma.kanbanTask.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = (maxTask?.position ?? -1) + 1;

    // Create task
    const task = await prisma.kanbanTask.create({
      data: {
        title,
        description,
        boardId,
        position: newPosition,
        priority: priority ?? "MEDIUM",
        assigneeId,
        projectId: board.projectId,
        tags: tags ?? [],
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours,
        createdBy: user.id,
      },
      include: {
        assignee: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
