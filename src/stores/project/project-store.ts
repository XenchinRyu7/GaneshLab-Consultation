import { createStore } from "zustand/vanilla";

export type ProjectType =
  | "WEB_APPLICATION"
  | "MOBILE_APPLICATION"
  | "IOT"
  | "WEB_BANKING"
  | "E_COMMERCE"
  | "ENTERPRISE_SOFTWARE"
  | "CUSTOM_SOFTWARE"
  | "CONSULTATION"
  | "MAINTENANCE"
  | "OTHER";

export type ProjectComplexity = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

export type ProjectPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ProjectStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "ACTIVE"
  | "COMPLETED"
  | "ON_MAINTAIN"
  | "CANCELLED";

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  clientId: string;
  picId: string;
  status: ProjectStatus;

  // Project Type & Category
  type: ProjectType;
  category?: string | null;

  // Budget & Pricing
  budgetMin?: number | null;
  budgetMax?: number | null;
  estimatedCost?: number | null;

  // Project Details
  complexity: ProjectComplexity;
  priority: ProjectPriority;
  timeline?: number | null;
  startDate?: string | null;
  endDate?: string | null;

  // Technology & Requirements
  technologyStack?: string | null;
  requirements?: string | null;
  features?: string | null;
  deliverables?: string | null;

  // Company Relation
  companyId?: string | null;
  company?: {
    id: string;
    name: string;
    website?: string | null;
  } | null;

  // Project Status Details
  progress: number;
  notes?: string | null;
  clientNotes?: string | null;

  // Metadata
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  // Relations
  client?: {
    id: string;
    fullname: string;
    email: string;
  };
  pic?: {
    id: string;
    fullname: string;
    email: string;
  };
}

export type ProjectState = {
  activeProject: Project | null;
  projects: Project[];
  setActiveProject: (project: Project | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  removeProject: (projectId: string) => void;
};

export const createProjectStore = (init?: Partial<ProjectState>) =>
  createStore<ProjectState>()((set, get) => ({
    activeProject: init?.activeProject ?? null,
    projects: init?.projects ?? [],

    setActiveProject: project => {
      set({ activeProject: project });
      // Save to localStorage for persistence
      if (typeof window !== "undefined") {
        if (project) {
          localStorage.setItem("activeProjectId", project.id);
        } else {
          localStorage.removeItem("activeProjectId");
        }
      }
    },

    setProjects: projects => set({ projects }),

    addProject: project => {
      const currentProjects = get().projects;
      set({ projects: [...currentProjects, project] });
    },

    updateProject: (projectId, updates) => {
      const currentProjects = get().projects;
      const updatedProjects = currentProjects.map(p =>
        p.id === projectId ? { ...p, ...updates } : p
      );
      set({ projects: updatedProjects });

      // Update active project if it's the one being updated
      const activeProject = get().activeProject;
      if (activeProject?.id === projectId) {
        set({ activeProject: { ...activeProject, ...updates } });
      }
    },

    removeProject: projectId => {
      const currentProjects = get().projects;
      const filteredProjects = currentProjects.filter(p => p.id !== projectId);
      set({ projects: filteredProjects });

      // Clear active project if it's the one being removed
      const activeProject = get().activeProject;
      if (activeProject?.id === projectId) {
        set({ activeProject: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("activeProjectId");
        }
      }
    },
  }));
