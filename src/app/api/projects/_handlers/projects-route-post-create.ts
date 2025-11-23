/**
 * Project creation function for POST handler
 */

import type { ProjectType, ProjectComplexity, ProjectPriority } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { formatProject } from "../_helpers/projects-route-helpers";
import type { CreateProjectBody } from "../_types/projects-route-types";

/**
 * Build basic project fields
 */
function buildBasicFields(data: CreateProjectBody) {
  return {
    name: data.name,
    description: data.description ?? null,
    clientId: data.clientId,
    picId: data.picId,
    status: "PENDING" as const,
  };
}

/**
 * Build project type and category
 */
function buildTypeFields(data: CreateProjectBody) {
  return {
    type: (data.type ?? "OTHER") as ProjectType,
    category: data.category ?? null,
  };
}

/**
 * Build budget fields
 */
function buildBudgetFields(data: CreateProjectBody) {
  return {
    budgetMin: data.budgetMin ?? null,
    budgetMax: data.budgetMax ?? null,
    estimatedCost: data.estimatedCost ?? null,
  };
}

/**
 * Build complexity and priority fields
 */
function buildComplexityFields(data: CreateProjectBody) {
  return {
    complexity: (data.complexity ?? "MEDIUM") as ProjectComplexity,
    priority: (data.priority ?? "MEDIUM") as ProjectPriority,
  };
}

/**
 * Build date fields
 */
function buildDateFields(data: CreateProjectBody) {
  return {
    timeline: data.timeline ?? null,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
  };
}

/**
 * Build project details fields
 */
function buildDetailsFields(data: CreateProjectBody, finalCompanyId: string) {
  return {
    technologyStack: data.technologyStack ?? null,
    requirements: data.requirements ?? null,
    features: data.features ?? null,
    deliverables: data.deliverables ?? null,
    companyId: finalCompanyId,
    notes: data.notes ?? null,
    clientNotes: data.clientNotes ?? null,
    progress: 0,
  };
}

/**
 * Build project data object
 */
function buildProjectData(data: CreateProjectBody, finalCompanyId: string) {
  return {
    ...buildBasicFields(data),
    ...buildTypeFields(data),
    ...buildBudgetFields(data),
    ...buildComplexityFields(data),
    ...buildDateFields(data),
    ...buildDetailsFields(data, finalCompanyId),
  };
}

/**
 * Create project in database
 */
export async function createProject(data: CreateProjectBody, finalCompanyId: string) {
  const projectData = buildProjectData(data, finalCompanyId);

  const project = await prisma.project.create({
    data: projectData,
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

  return formatProject(project);
}
