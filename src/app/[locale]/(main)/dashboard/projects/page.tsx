"use client";

import { useEffect, useState, useCallback } from "react";

import { Plus, Loader2, Users } from "lucide-react";
import { useTranslations } from "next-intl";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "@/i18n/routing";
import { useProjectStore } from "@/stores/project/project-provider";
import type { Project } from "@/stores/project/project-store";
import { useUserStore } from "@/stores/user/user-provider";

import { CreateProjectDialog } from "./_components/create-project-dialog";
import { EditProjectDialog } from "./_components/edit-project-dialog";
import { ProjectList } from "./_components/project-list";
import {
  filterProjectsByClient,
  getClientProjectCount,
  getUniqueClients,
} from "./_helpers/projects-page-client-filter";
import {
  validateUserForProjectCreation,
  validateUserForProjectEdit,
} from "./_helpers/projects-page-validation";
import { useCompanyProfileCheck } from "./_hooks/use-company-profile-check";
import { useProjectCRUD } from "./_hooks/use-project-crud";

export default function ProjectsPage() {
  const router = useRouter();
  const t = useTranslations("Projects");
  const currentUser = useUserStore(state => state.currentUser);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("all");

  const projects = useProjectStore(state => state.projects);
  const uniqueClients = getUniqueClients(projects);
  const filteredProjects = filterProjectsByClient(projects, selectedClientId);

  const setProjects = useProjectStore(state => state.setProjects);
  const addProject = useProjectStore(state => state.addProject);
  const updateProject = useProjectStore(state => state.updateProject);
  const removeProject = useProjectStore(state => state.removeProject);

  // Fetch projects callback
  const fetchProjects = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: currentUser.id,
        role: currentUser.role,
      });
      const response = await fetch(`/api/projects?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data.projects ?? []);
    } catch (error: unknown) {
      console.error("Error fetching projects:", error);
      toast.error(error instanceof Error ? error.message : t("failedToFetchProjects"));
    } finally {
      setLoading(false);
    }
  }, [currentUser, setProjects, t]);

  // Company profile check hook
  const {
    isCheckingCompanyProfile,
    setIsCheckingCompanyProfile,
    checkCompanyProfile,
    handleCompanyProfileError,
  } = useCompanyProfileCheck(t, router);

  // Project CRUD hook
  const { handleCreateProject, handleUpdateProject, confirmDeleteProject } = useProjectCRUD({
    currentUser,
    t,
    addProject,
    updateProject,
    removeProject,
    fetchProjects,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
  });

  // Fetch projects on mount
  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser, fetchProjects]);

  // Reset checking state when dialog opens/closes
  useEffect(() => {
    if (isCreateDialogOpen) {
      setIsCheckingCompanyProfile(false);
    }
  }, [isCreateDialogOpen, setIsCheckingCompanyProfile]);

  // Handle create project click - check profile first
  async function handleCreateProjectClick() {
    if (!validateUserForProjectCreation(currentUser, t)) return;
    if (isCheckingCompanyProfile) return;

    try {
      setIsCheckingCompanyProfile(true);
      const checkResult = await checkCompanyProfile();
      if (!checkResult) return;

      if (!isCreateDialogOpen) {
        setIsCreateDialogOpen(true);
      }
    } catch (error: unknown) {
      handleCompanyProfileError(error);
    } finally {
      setIsCheckingCompanyProfile(false);
    }
  }

  // Handle delete project click
  function handleDeleteProject(projectId: string) {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  }

  // Confirm delete
  async function onConfirmDelete() {
    await confirmDeleteProject(projectToDelete);
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  }

  // Handle edit click
  function handleEditClick(project: Project) {
    if (!validateUserForProjectEdit(currentUser, t)) {
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
        {currentUser?.role === "client" && (
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
        )}
      </div>

      {/* Client Filter for ADMIN/PIC */}
      {(currentUser?.role === "admin" || currentUser?.role === "pic") &&
        uniqueClients.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground h-4 w-4" />
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients ({projects.length} projects)</SelectItem>
                {uniqueClients.map(client => {
                  const clientProjectCount = getClientProjectCount(projects, client.id);
                  return (
                    <SelectItem key={client.id} value={client.id}>
                      {client.fullname} ({clientProjectCount})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

      <ProjectList
        projects={filteredProjects}
        onEdit={handleEditClick}
        onDelete={handleDeleteProject}
        onCreateNew={handleCreateProjectClick}
        userRole={currentUser?.role}
      />

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateProject}
      />

      {editingProject && (
        <EditProjectDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          project={editingProject}
          onSubmit={data => handleUpdateProject(editingProject.id, data)}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteProject")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteProjectConfirmation")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete}>{t("confirmDelete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
