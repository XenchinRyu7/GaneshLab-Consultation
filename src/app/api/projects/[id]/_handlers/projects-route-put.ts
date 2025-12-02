/**
 * PUT handler for /api/projects/[id]
 */

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { buildUpdateData } from "./projects-route-put-build";
import {
  validateBudgetRange,
  validatePIC,
  validateProgress,
} from "./projects-route-put-validation";

/**
 * Helper function to convert Prisma Decimal to number
 */
function decimalToNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "object" && "toNumber" in value
    ? (value as { toNumber: () => number }).toNumber()
    : Number(value);
}

/**
 * Helper function to format project response
 */
export function formatProject(project: unknown) {
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

/**
 * PUT /api/projects/[id] - Update a project
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Validate PIC if being updated
    const picError = await validatePIC(body.picId, existingProject.picId, existingProject.status);
    if (picError) return picError;

    // Validate budget range
    const budgetError = validateBudgetRange(body.budgetMin, body.budgetMax);
    if (budgetError) return budgetError;

    // Validate progress
    const progressError = validateProgress(body.progress);
    if (progressError) return progressError;

    // Build update data
    const updateData = buildUpdateData(body);

    // Update project
    const project = await prisma.project.update({
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
        company: {
          select: {
            id: true,
            name: true,
            website: true,
          },
        },
      },
    });

    return NextResponse.json({ project: formatProject(project) }, { status: 200 });
  } catch (error) {
    console.error("Error updating project:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
