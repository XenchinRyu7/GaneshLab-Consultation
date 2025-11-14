/**
 * Validation functions for POST projects handler
 */

import { NextResponse } from "next/server";

import type { CreateProjectBody } from "../_types/projects-route-types";

/**
 * Validate required fields
 */
export function validateRequiredFields(body: CreateProjectBody): NextResponse | null {
  if (!body.name || !body.clientId || !body.picId) {
    return NextResponse.json({ error: "Name, clientId, and picId are required" }, { status: 400 });
  }
  return null;
}

/**
 * Validate budget range
 */
export function validateBudgetRange(
  budgetMin: number | null | undefined,
  budgetMax: number | null | undefined
): NextResponse | null {
  if (
    budgetMin !== null &&
    budgetMin !== undefined &&
    budgetMax !== null &&
    budgetMax !== undefined &&
    budgetMin > budgetMax
  ) {
    return NextResponse.json(
      { error: "Budget minimum cannot be greater than budget maximum" },
      { status: 400 }
    );
  }
  return null;
}
