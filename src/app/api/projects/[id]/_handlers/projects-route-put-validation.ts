/**
 * Validation functions for PUT /api/projects/[id]
 */

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * Validate PIC if being updated
 */
export async function validatePIC(
  picId: string | undefined,
  existingPicId: string | null,
  projectStatus?: string
): Promise<NextResponse | null> {
  if (!picId || picId === existingPicId) {
    return null;
  }

  // Prevent PIC changes for approved projects
  if (projectStatus && projectStatus !== "PENDING") {
    return NextResponse.json(
      {
        error: "Cannot change PIC for approved projects",
      },
      { status: 400 }
    );
  }

  const pic = await prisma.userProfile.findUnique({
    where: { id: picId },
  });

  if (!pic) {
    return NextResponse.json({ error: "PIC not found" }, { status: 404 });
  }

  if (pic.role !== "pic") {
    return NextResponse.json({ error: "Selected user is not a PIC" }, { status: 400 });
  }

  return null;
}

/**
 * Validate status
 */
export function validateStatus(status: unknown): NextResponse | null {
  if (!status) return null;

  const validStatuses = ["active", "completed", "cancelled", "pending", "on_hold"];
  if (!validStatuses.includes(status as string)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  return null;
}

/**
 * Validate budget range
 */
export function validateBudgetRange(budgetMin: unknown, budgetMax: unknown): NextResponse | null {
  if (budgetMin === undefined || budgetMax === undefined) {
    return null;
  }

  if (budgetMin !== null && budgetMax !== null && Number(budgetMin) > Number(budgetMax)) {
    return NextResponse.json(
      { error: "Budget minimum cannot be greater than budget maximum" },
      { status: 400 }
    );
  }

  return null;
}

/**
 * Validate progress
 */
export function validateProgress(progress: unknown): NextResponse | null {
  if (progress === undefined) return null;

  const progressNum = Number(progress);
  if (progressNum < 0 || progressNum > 100) {
    return NextResponse.json({ error: "Progress must be between 0 and 100" }, { status: 400 });
  }

  return null;
}
