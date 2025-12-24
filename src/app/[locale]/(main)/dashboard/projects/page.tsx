"use client";

import { useEffect, useState, useCallback } from "react";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/stores/project/project-provider";
import type { Project } from "@/stores/project/project-store";
import { useUserStore } from "@/stores/user/user-provider";

import { CreateProjectDialog } from "./_components/create-project-dialog";
import { EditProjectDialog } from "./_components/edit-project-dialog";
import { ProjectList } from "./_components/project-list";
import {
  createProjectViaAPI,
  fetchCompanyIdForProject,
  verifyCompanyProfileForProject,
} from "./_helpers/projects-page-helpers";

export default function ProjectsPage() {
  const router = useRouter();
  const t = useTranslations("Projects");
  const currentUser = useUserStore(state => state.currentUser);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCheckingCompanyProfile, setIsCheckingCompanyProfile] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const projects = useProjectStore(state => state.projects);
  const setProjects = useProjectStore(state => state.setProjects);
  const addProject = useProjectStore(state => state.addProject);
  const updateProject = useProjectStore(state => state.updateProject);
  const removeProject = useProjectStore(state => state.removeProject);

  const fetchProjects = useCallback(async () => {
    if (!currentUser) {
      console.error("No user found");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: currentUser.id,
        role: currentUser.role,
      });
      const url = `/api/projects?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json();
        console.error("Error fetching projects:", error);
        throw new Error(error.error ?? "Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data.projects ?? []);
    } catch (error: unknown) {
      console.error("Error fetching projects:", error);
      toast.error(error instanceof Error ? error.message : t("failedToFetchProjects"));
    } finally {
      setLoading(false);
    }
  }, [currentUser, setProjects]);

  // Fetch projects on mount
  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser, fetchProjects]);

  // Reset loading state when dialog opens/closes
  useEffect(() => {
    if (isCreateDialogOpen) {
      setIsCheckingCompanyProfile(false);
    }
  }, [isCreateDialogOpen]);

  function validateUserForProjectCreation() {
    if (!currentUser || currentUser.role !== "client") {
      toast.error(t("onlyClientsCanCreate"));
      return false;
    }
    return true;
  }

  async function checkCompanyProfile() {
    const checkResponse = await fetch("/api/companies/check");
    if (!checkResponse.ok) {
      console.error("Error checking company profile:", await checkResponse.text());
      toast.error(t("failedToVerifyCompanyProfile"));
      return null;
    }

    const checkData = await checkResponse.json();

    if (!checkData.isComplete) {
      toast.error(checkData.message ?? t("completeCompanyProfileFirst"), {
        description: checkData.missingFields
          ? `${t("missingFields")}: ${checkData.missingFields.join(", ")}`
          : t("goToProfile"),
        action: {
          label: t("goToProfile"),
          onClick: () => router.push("/dashboard/account"),
        },
      });
      return null;
    }

    return checkData;
  }

  function handleCompanyProfileError(error: unknown) {
    console.error("Error checking company profile:", error);
    toast.error(error instanceof Error ? error.message : t("failedToVerifyCompanyProfileRetry"));
  }

  async function handleCreateProjectClick() {
    if (!validateUserForProjectCreation()) return;
    if (isCheckingCompanyProfile) return; // Prevent multiple clicks

    try {
      setIsCheckingCompanyProfile(true);

      const checkResult = await checkCompanyProfile();
      if (!checkResult) return; // Profile check failed

      // Company profile is complete, open dialog
      if (!isCreateDialogOpen) {
        setIsCreateDialogOpen(true);
      }
    } catch (error: unknown) {
      handleCompanyProfileError(error);
    } finally {
      setIsCheckingCompanyProfile(false);
    }
  }

  async function handleCreateProject(projectData: Record<string, unknown>) {
    if (!currentUser || currentUser.role !== "client") {
      console.error("Only clients can create projects");
      toast.error(t("onlyClientsCanCreate"));
      return;
    }

    try {
      const clientId = currentUser.id;
      const companyId = await fetchCompanyIdForProject(clientId);

      const { shouldRedirect } = await verifyCompanyProfileForProject();
      if (shouldRedirect) {
        toast.error(t("companyProfileIncomplete"));
        setIsCreateDialogOpen(false);
        router.push("/dashboard/account");
        return;
      }

      const data = await createProjectViaAPI(projectData, clientId, companyId);
      addProject(data.project);
      setIsCreateDialogOpen(false);
      toast.success(t("projectCreatedSuccessfully"));
      fetchProjects(); // Refresh projects list
    } catch (error: unknown) {
      console.error("Error creating project:", error);
      toast.error(error instanceof Error ? error.message : t("failedToCreateProject"));
    }
  }

  async function handleUpdateProject(projectId: string, updates: Record<string, unknown>) {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error updating project:", error);
        throw new Error(error.error ?? "Failed to update project");
      }

      const data = await response.json();
      updateProject(projectId, data.project);
      setIsEditDialogOpen(false);
      setEditingProject(null);
      toast.success(t("projectUpdatedSuccessfully"));
      fetchProjects(); // Refresh projects list
    } catch (error: unknown) {
      console.error("Error updating project:", error);
      toast.error(error instanceof Error ? error.message : t("failedToUpdateProject"));
    }
  }

  function handleDeleteProject(projectId: string) {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  }

  async function confirmDeleteProject() {
    if (!projectToDelete) return;

    try {
      const response = await fetch(`/api/projects/${projectToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error deleting project:", error);
        throw new Error(error.error ?? "Failed to delete project");
      }

      removeProject(projectToDelete);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      toast.success(t("projectDeletedSuccessfully"));
      fetchProjects(); // Refresh projects list
    } catch (error: unknown) {
      console.error("Error deleting project:", error);
      toast.error(error instanceof Error ? error.message : t("failedToDeleteProject"));
    }
  }

  function handleEditClick(project: Project) {
    if (!currentUser || currentUser.role !== "client") {
      toast.error(t("onlyClientsCanEdit"));
      return;
    }
    setEditingProject(project);
    setIsEditDialogOpen(true);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("manageDescription")}</p>
          </div>
        </div>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t("loadingProjects")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("manageDescription")}</p>
        </div>
        <Button onClick={handleCreateProjectClick} disabled={isCheckingCompanyProfile}>
          {isCheckingCompanyProfile ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("checking")}
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              {t("createProject")}
            </>
          )}
        </Button>
      </div>

      <ProjectList
        projects={projects}
        onEdit={handleEditClick}
        onDelete={handleDeleteProject}
        onCreateNew={handleCreateProjectClick}
        userRole={currentUser?.role}
      />

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={open => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setIsCheckingCompanyProfile(false);
          }
        }}
        onSubmit={handleCreateProject}
      />

      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={updates => handleUpdateProject(editingProject.id, updates)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteProject")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteProjectConfirmation")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
