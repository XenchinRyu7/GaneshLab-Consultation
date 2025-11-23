/**
 * PUT /api/kanban/boards/[id] - Update board (title, color)
 * DELETE /api/kanban/boards/[id] - Delete board
 * PATCH /api/kanban/boards/[id] - Reorder boards
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Update board
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, color } = body;

    // Verify user is PIC of the project
    const board = await prisma.kanbanBoard.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!board || board.project.picId !== user.id) {
      return NextResponse.json({ error: "Board not found or access denied" }, { status: 404 });
    }

    // Update board
    const updated = await prisma.kanbanBoard.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(color && { color }),
      },
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
    });

    return NextResponse.json({ board: updated });
  } catch (error) {
    console.error("Error updating board:", error);
    return NextResponse.json({ error: "Failed to update board" }, { status: 500 });
  }
}

// DELETE - Delete board
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify user is PIC of the project
    const board = await prisma.kanbanBoard.findUnique({
      where: { id },
      include: { project: true, tasks: true },
    });

    if (!board || board.project.picId !== user.id) {
      return NextResponse.json({ error: "Board not found or access denied" }, { status: 404 });
    }

    if (board.tasks.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete board with tasks. Move or delete tasks first." },
        { status: 400 }
      );
    }

    // Delete board
    await prisma.kanbanBoard.delete({ where: { id } });

    // Reorder remaining boards
    const remainingBoards = await prisma.kanbanBoard.findMany({
      where: { projectId: board.projectId },
      orderBy: { position: "asc" },
    });

    await Promise.all(
      remainingBoards.map((b, index) =>
        prisma.kanbanBoard.update({
          where: { id: b.id },
          data: { position: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting board:", error);
    return NextResponse.json({ error: "Failed to delete board" }, { status: 500 });
  }
}

// PATCH - Reorder boards
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { newPosition } = body;

    if (typeof newPosition !== "number" || newPosition < 0) {
      return NextResponse.json({ error: "Invalid position" }, { status: 400 });
    }

    // Verify user is PIC of the project
    const board = await prisma.kanbanBoard.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!board || board.project.picId !== user.id) {
      return NextResponse.json({ error: "Board not found or access denied" }, { status: 404 });
    }

    const oldPosition = board.position;

    // Get all boards for this project to update positions
    await prisma.kanbanBoard.findMany({
      where: { projectId: board.projectId },
      orderBy: { position: "asc" },
    });

    // Update positions
    await prisma.$transaction(async tx => {
      if (newPosition > oldPosition) {
        // Moving right
        await tx.kanbanBoard.updateMany({
          where: {
            projectId: board.projectId,
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
        // Moving left
        await tx.kanbanBoard.updateMany({
          where: {
            projectId: board.projectId,
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

      // Update moved board
      await tx.kanbanBoard.update({
        where: { id },
        data: { position: newPosition },
      });
    });

    // Fetch updated boards
    const updatedBoards = await prisma.kanbanBoard.findMany({
      where: { projectId: board.projectId },
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

    return NextResponse.json({ boards: updatedBoards });
  } catch (error) {
    console.error("Error reordering boards:", error);
    return NextResponse.json({ error: "Failed to reorder boards" }, { status: 500 });
  }
}
