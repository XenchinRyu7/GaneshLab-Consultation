import * as z from "zod";

import type {
  ProjectType,
  ProjectComplexity,
  ProjectPriority,
} from "@/stores/project/project-store";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  picId: z.string().min(1, "PIC is required"),
  type: z.enum([
    "WEB_APPLICATION",
    "MOBILE_APPLICATION",
    "IOT",
    "WEB_BANKING",
    "E_COMMERCE",
    "ENTERPRISE_SOFTWARE",
    "CUSTOM_SOFTWARE",
    "CONSULTATION",
    "MAINTENANCE",
    "OTHER",
  ]),
  category: z.string().optional(),
  budgetMin: z.number().min(0).optional().nullable(),
  budgetMax: z.number().min(0).optional().nullable(),
  complexity: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  timeline: z.number().min(1).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  technologyStack: z.string().optional(),
  requirements: z.string().optional(),
  features: z.string().optional(),
  deliverables: z.string().optional(),
  clientNotes: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "WEB_APPLICATION", label: "Web Application" },
  { value: "MOBILE_APPLICATION", label: "Mobile Application" },
  { value: "IOT", label: "IoT" },
  { value: "WEB_BANKING", label: "Web Banking" },
  { value: "E_COMMERCE", label: "E-Commerce" },
  { value: "ENTERPRISE_SOFTWARE", label: "Enterprise Software" },
  { value: "CUSTOM_SOFTWARE", label: "Custom Software" },
  { value: "CONSULTATION", label: "Consultation" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OTHER", label: "Other" },
];

export const COMPLEXITY_LEVELS: { value: ProjectComplexity; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "VERY_HIGH", label: "Very High" },
];

export const PRIORITY_LEVELS: { value: ProjectPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];
