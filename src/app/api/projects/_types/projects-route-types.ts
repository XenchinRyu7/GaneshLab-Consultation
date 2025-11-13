/**
 * Types for projects API route
 */

import type { Prisma, ProjectType, ProjectComplexity, ProjectPriority } from "@prisma/client";

// Prisma Decimal type (can be number, string, or Decimal object)
export type PrismaDecimal = number | string | { toNumber(): number };

// Project with relations from Prisma
export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    client: {
      select: {
        id: true;
        fullname: true;
        email: true;
      };
    };
    pic: {
      select: {
        id: true;
        fullname: true;
        email: true;
      };
    };
    company: {
      select: {
        id: true;
        name: true;
        website: true;
      };
    };
  };
}>;

// Formatted project response (Decimal converted to number)
export interface FormattedProject {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  picId: string;
  status: string;
  type: string;
  category: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  estimatedCost: number | null;
  complexity: string;
  priority: string;
  timeline: number | null;
  startDate: string | null;
  endDate: string | null;
  technologyStack: string | null;
  requirements: string | null;
  features: string | null;
  deliverables: string | null;
  companyId: string | null;
  notes: string | null;
  clientNotes: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  client: {
    id: string;
    fullname: string;
    email: string;
  };
  pic: {
    id: string;
    fullname: string;
    email: string;
  };
  company?: {
    id: string;
    name: string;
    website: string | null;
  };
}

// Create project request body
export interface CreateProjectBody {
  name: string;
  description?: string | null;
  clientId: string;
  picId: string;
  type?: ProjectType | string;
  category?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  estimatedCost?: number | null;
  complexity?: ProjectComplexity | string;
  priority?: ProjectPriority | string;
  timeline?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  technologyStack?: string | null;
  requirements?: string | null;
  features?: string | null;
  deliverables?: string | null;
  companyId?: string | null;
  notes?: string | null;
  clientNotes?: string | null;
}
