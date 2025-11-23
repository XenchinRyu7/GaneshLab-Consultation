/**
 * POST handler for projects API route
 */

import { NextRequest, NextResponse } from "next/server";

import type { CreateProjectBody } from "../_types/projects-route-types";

import { createProject } from "./projects-route-post-create";
import { validateRequiredFields, validateBudgetRange } from "./projects-route-post-validation";
import { verifyClient, verifyPIC, verifyCompanyProfile } from "./projects-route-post-verification";

/**
 * Validate and verify request
 */
async function validateAndVerify(body: CreateProjectBody) {
  // Validate required fields
  const requiredError = validateRequiredFields(body);
  if (requiredError) return { error: requiredError, client: null, finalCompanyId: null };

  // Validate budget range
  const budgetError = validateBudgetRange(body.budgetMin, body.budgetMax);
  if (budgetError) return { error: budgetError, client: null, finalCompanyId: null };

  // Verify client
  const { error: clientError, client } = await verifyClient(body.clientId);
  if (clientError || !client) {
    return {
      error: clientError,
      client: null,
      finalCompanyId: null,
    };
  }

  // Verify PIC
  const { error: picError } = await verifyPIC(body.picId);
  if (picError) return { error: picError, client: null, finalCompanyId: null };

  // Verify company profile
  const { error: companyError } = verifyCompanyProfile(client);
  if (companyError) return { error: companyError, client: null, finalCompanyId: null };

  // Get companyId
  const finalCompanyId = body.companyId ?? client.company!.id;

  return { error: null, client, finalCompanyId };
}

/**
 * POST /api/projects - Create a new project
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateProjectBody;

    // Validate and verify
    const { error, finalCompanyId } = await validateAndVerify(body);
    if (error) return error;
    if (!finalCompanyId)
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });

    // Create project
    const formattedProject = await createProject(body, finalCompanyId);

    return NextResponse.json({ project: formattedProject }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
