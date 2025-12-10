/**
 * PUT /api/milestone/tasks/[id] - Update task
 * DELETE /api/milestone/tasks/[id] - Delete task
 * PATCH /api/milestone/tasks/[id]/move - Move task (drag & drop)
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Update task
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, priority, assigneeId, tags, dueDate, estimatedHours } = body;

    // Verify task exists and user has access
    const task = await prisma.milestoneTask.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (
      task.project.clientId !== user.id &&
      task.project.picId !== user.id &&
      user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update task
    const updated = await prisma.milestoneTask.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(tags && { tags }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(estimatedHours !== undefined && { estimatedHours }),
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

    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE - Delete task
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify task exists and user has access
    const task = await prisma.milestoneTask.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (
      task.project.clientId !== user.id &&
      task.project.picId !== user.id &&
      user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete task
    await prisma.milestoneTask.delete({ where: { id } });

    // Reorder remaining tasks in the same board
    const remainingTasks = await prisma.milestoneTask.findMany({
      where: { boardId: task.boardId },
      orderBy: { position: "asc" },
    });

    await Promise.all(
      remainingTasks.map((t, index) =>
        prisma.milestoneTask.update({
          where: { id: t.id },
          data: { position: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
