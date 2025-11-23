/**
 * GET /api/kanban/boards - Get all boards for a project
 * POST /api/kanban/boards - Create a new board
 */

import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch all boards for a project
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    // Verify user has access to this project
    const whereClause =
      user.role === "admin"
        ? {
            id: projectId,
            deletedAt: null,
          }
        : {
            id: projectId,
            OR: [{ clientId: user.id }, { picId: user.id }],
            deletedAt: null,
          };

    const project = await prisma.project.findFirst({
      where: whereClause,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
    }

    // Check if project is approved
    if (project.status !== "APPROVED" && project.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Kanban board only available for approved or active projects" },
        { status: 403 }
      );
    }

    // Fetch boards with tasks
    const boards = await prisma.kanbanBoard.findMany({
      where: { projectId },
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
    console.error("Error fetching boards:", error);
    return NextResponse.json({ error: "Failed to fetch boards" }, { status: 500 });
  }
}

// POST - Create a new board
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, color, projectId } = body;

    if (!title || !projectId) {
      return NextResponse.json({ error: "Title and projectId required" }, { status: 400 });
    }

    // Verify user is PIC of the project or admin
    const whereClausePost =
      user.role === "admin"
        ? {
            id: projectId,
            deletedAt: null,
          }
        : {
            id: projectId,
            picId: user.id,
            deletedAt: null,
          };

    const project = await prisma.project.findFirst({
      where: whereClausePost,
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Check if project is approved
    if (project.status !== "APPROVED" && project.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Kanban board only available for approved or active projects" },
        { status: 403 }
      );
    }

    // Get max position
    const maxBoard = await prisma.kanbanBoard.findFirst({
      where: { projectId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const newPosition = (maxBoard?.position ?? -1) + 1;

    // Create board
    const board = await prisma.kanbanBoard.create({
      data: {
        title,
        color: color ?? "#3b82f6",
        position: newPosition,
        projectId,
      },
      include: {
        tasks: true,
      },
    });

    return NextResponse.json({ board }, { status: 201 });
  } catch (error) {
    console.error("Error creating board:", error);
    return NextResponse.json({ error: "Failed to create board" }, { status: 500 });
  }
}
