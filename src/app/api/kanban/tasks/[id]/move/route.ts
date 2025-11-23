/**
 * PATCH /api/kanban/tasks/[id]/move - Move task to different board or reorder
 * Handles drag & drop functionality
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { newBoardId, newPosition } = body;

    if (!newBoardId || typeof newPosition !== "number" || newPosition < 0) {
      return NextResponse.json({ error: "newBoardId and newPosition required" }, { status: 400 });
    }

    // Verify task exists and user has access
    const task = await prisma.kanbanTask.findUnique({
      where: { id },
      include: { project: true, board: true },
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

    // Verify new board exists and belongs to same project
    const newBoard = await prisma.kanbanBoard.findUnique({
      where: { id: newBoardId },
    });

    if (!newBoard || newBoard.projectId !== task.projectId) {
      return NextResponse.json({ error: "Invalid board" }, { status: 400 });
    }

    const oldBoardId = task.boardId;
    const oldPosition = task.position;
    const isSameBoard = oldBoardId === newBoardId;

    await prisma.$transaction(async tx => {
      if (isSameBoard) {
        // Reordering within same board
        if (newPosition > oldPosition) {
          // Moving down
          await tx.kanbanTask.updateMany({
            where: {
              boardId: oldBoardId,
              position: {
                gt: oldPosition,
                lte: newPosition,
              },
            },
            data: {
              position: {
                decrement: 1,
              },
            },
          });
        } else if (newPosition < oldPosition) {
          // Moving up
          await tx.kanbanTask.updateMany({
            where: {
              boardId: oldBoardId,
              position: {
                gte: newPosition,
                lt: oldPosition,
              },
            },
            data: {
              position: {
                increment: 1,
              },
            },
          });
        }
      } else {
        // Moving to different board
        // 1. Shift tasks in old board up to fill gap
        await tx.kanbanTask.updateMany({
          where: {
            boardId: oldBoardId,
            position: {
              gt: oldPosition,
            },
          },
          data: {
            position: {
              decrement: 1,
            },
          },
        });

        // 2. Shift tasks in new board down to make space
        await tx.kanbanTask.updateMany({
          where: {
            boardId: newBoardId,
            position: {
              gte: newPosition,
            },
          },
          data: {
            position: {
              increment: 1,
            },
          },
        });
      }

      // 3. Update the moved task
      await tx.kanbanTask.update({
        where: { id },
        data: {
          boardId: newBoardId,
          position: newPosition,
        },
      });
    });

    // Fetch all boards with updated tasks
    const boards = await prisma.kanbanBoard.findMany({
      where: { projectId: task.projectId },
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                fullname: true,
                email: true,
              },
            },
          },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({ boards });
  } catch (error) {
    console.error("Error moving task:", error);
    return NextResponse.json({ error: "Failed to move task" }, { status: 500 });
  }
}
