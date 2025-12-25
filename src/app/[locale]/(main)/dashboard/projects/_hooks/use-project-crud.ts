/**
 * Custom hook for project CRUD operations
 */

import { useCallback } from "react";

import { toast } from "sonner";

import type { Project } from "@/stores/project/project-store";

import { createProjectViaAPI, fetchCompanyIdForProject } from "../_helpers/projects-page-helpers";

interface UseProjectCRUDProps {
  currentUser: { id: string; role: string } | null;
  t: (key: string) => string;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  fetchProjects: () => Promise<void>;
  setIsCreateDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
}

export function useProjectCRUD({
  currentUser,
  t,
  addProject,
  updateProject,
  removeProject,
  fetchProjects,
  setIsCreateDialogOpen,
  setIsEditDialogOpen,
}: UseProjectCRUDProps) {
  const handleCreateProject = useCallback(
    async (projectData: Record<string, unknown>) => {
      try {
        if (!currentUser) {
          throw new Error("User not found");
        }

        const companyId = await fetchCompanyIdForProject(currentUser.id);
        const response = await createProjectViaAPI(projectData, currentUser.id, companyId);
        const newProject = response.project;

        addProject(newProject);
        setIsCreateDialogOpen(false);
        toast.success(t("projectCreatedSuccessfully"));
        fetchProjects();
      } catch (error: unknown) {
        console.error("Error creating project:", error);
        toast.error(error instanceof Error ? error.message : t("failedToCreateProject"));
      }
    },
    [currentUser, addProject, setIsCreateDialogOpen, t, fetchProjects]
  );

  const handleUpdateProject = useCallback(
    async (projectId: string, updates: Record<string, unknown>) => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error ?? "Failed to update project");
        }

        const data = await response.json();
        updateProject(projectId, data.project);
        setIsEditDialogOpen(false);
        toast.success(t("projectUpdatedSuccessfully"));
        fetchProjects();
      } catch (error: unknown) {
        console.error("Error updating project:", error);
        toast.error(error instanceof Error ? error.message : t("failedToUpdateProject"));
      }
    },
    [updateProject, setIsEditDialogOpen, t, fetchProjects]
  );

  const confirmDeleteProject = useCallback(
    async (projectToDelete: string | null) => {
      if (!projectToDelete) return;

      try {
        const response = await fetch(`/api/projects/${projectToDelete}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error ?? "Failed to delete project");
        }

        removeProject(projectToDelete);
        toast.success(t("projectDeletedSuccessfully"));
        fetchProjects();
      } catch (error: unknown) {
        console.error("Error deleting project:", error);
        toast.error(error instanceof Error ? error.message : t("failedToDeleteProject"));
      }
    },
    [removeProject, t, fetchProjects]
  );

  return {
    handleCreateProject,
    handleUpdateProject,
    confirmDeleteProject,
  };
}
