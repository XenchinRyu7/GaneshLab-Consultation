/**
 * Helper functions for projects API route
 */

import type {
  PrismaDecimal,
  ProjectWithRelations,
  FormattedProject,
} from "../_types/projects-route-types";

/**
 * Convert Prisma Decimal to number
 */
export function decimalToNumber(value: PrismaDecimal | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && "toNumber" in value) {
    return value.toNumber();
  }
  return Number(value);
}

/**
 * Format project response (convert Decimal to number, Date to ISO string)
 */
export function formatProject(project: ProjectWithRelations): FormattedProject {
  const formatted: FormattedProject = {
    id: project.id,
    name: project.name,
    description: project.description,
    clientId: project.clientId,
    picId: project.picId,
    status: project.status,
    type: project.type,
    category: project.category,
    budgetMin: decimalToNumber(project.budgetMin),
    budgetMax: decimalToNumber(project.budgetMax),
    estimatedCost: decimalToNumber(project.estimatedCost),
    complexity: project.complexity,
    priority: project.priority,
    timeline: project.timeline,
    startDate: project.startDate?.toISOString() ?? null,
    endDate: project.endDate?.toISOString() ?? null,
    technologyStack: project.technologyStack,
    requirements: project.requirements,
    features: project.features,
    deliverables: project.deliverables,
    companyId: project.companyId,
    notes: project.notes,
    clientNotes: project.clientNotes,
    progress: project.progress,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    deletedAt: project.deletedAt?.toISOString() ?? null,
    client: project.client,
    pic: project.pic,
  };

  if (project.company) {
    formatted.company = {
      id: project.company.id,
      name: project.company.name,
      website: project.company.website,
    };
  }

  return formatted;
}
