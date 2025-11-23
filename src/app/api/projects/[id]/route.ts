/**
 * Project API route by ID
 * Re-exports GET, PUT, and DELETE handlers
 */

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { PUT } from "./_handlers/projects-route-put";

// Helper function to convert Prisma Decimal to number
function decimalToNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "object" && "toNumber" in value
    ? (value as { toNumber: () => number }).toNumber()
    : Number(value);
}

// Helper function to format project response
function formatProject(project: unknown) {
  const proj = project as {
    budgetMin: unknown;
    budgetMax: unknown;
    estimatedCost: unknown;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    [key: string]: unknown;
  };

  return {
    ...proj,
    budgetMin: decimalToNumber(proj.budgetMin),
    budgetMax: decimalToNumber(proj.budgetMax),
    estimatedCost: decimalToNumber(proj.estimatedCost),
    startDate: proj.startDate?.toISOString() ?? null,
    endDate: proj.endDate?.toISOString() ?? null,
    createdAt: proj.createdAt.toISOString(),
    updatedAt: proj.updatedAt.toISOString(),
    deletedAt: proj.deletedAt?.toISOString() ?? null,
  };
}

// Re-export PUT handler
export { PUT };

// GET /api/projects/[id] - Get a single project
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
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
        company: {
          select: {
            id: true,
            name: true,
            website: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project: formatProject(project) }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching project:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete a project (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Soft delete by setting deletedAt
    await prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "CANCELLED",
      },
    });

    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting project:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
