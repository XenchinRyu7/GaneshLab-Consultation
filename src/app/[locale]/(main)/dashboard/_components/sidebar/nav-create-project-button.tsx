import { useState } from "react";

import { useRouter } from "next/navigation";

import { PlusCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { CreateProjectDialog } from "../../projects/_components/create-project-dialog";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useProjectStore } from "@/stores/project/project-provider";
import { useUserStore } from "@/stores/user/user-provider";

import {
  createProjectAPI,
  fetchCompanyId,
  verifyCompanyProfileComplete,
} from "./nav-create-project-button-helpers";

export function NavCreateProjectButton() {
  const router = useRouter();
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const currentUser = useUserStore(state => state.currentUser);
  const addProject = useProjectStore(state => state.addProject);
  const setActiveProject = useProjectStore(state => state.setActiveProject);

  const canCreateProject = currentUser?.role === "client";

  async function handleCreateProjectClick() {
    if (!currentUser || currentUser.role !== "client") {
      toast.error("Only clients can create projects");
      return;
    }

    try {
      const checkResponse = await fetch("/api/companies/check");
      if (!checkResponse.ok) {
        console.error("Error checking company profile:", await checkResponse.text());
        toast.error("Failed to verify company profile");
        return;
      }

      const checkData = await checkResponse.json();

      if (!checkData.isComplete) {
        toast.error(checkData.message ?? "Please complete your company profile first", {
          description: checkData.missingFields
            ? `Missing fields: ${checkData.missingFields.join(", ")}`
            : "Go to Account > Company Profile to complete your profile",
          action: {
            label: "Go to Profile",
            onClick: () => router.push("/dashboard/account"),
          },
        });
        return;
      }

      setIsCreateProjectDialogOpen(true);
    } catch (error: unknown) {
      console.error("Error checking company profile:", error);
      toast.error("Failed to verify company profile. Please try again.");
    }
  }

  async function handleCreateProject(projectData: Record<string, unknown>) {
    if (!currentUser || currentUser.role !== "client") {
      console.error("Only clients can create projects");
      toast.error("Only clients can create projects");
      return;
    }

    setIsCreating(true);
    try {
      const clientId = currentUser.id;
      const companyId = await fetchCompanyId(clientId);

      const { shouldRedirect } = await verifyCompanyProfileComplete();
      if (shouldRedirect) {
        toast.error("Company profile is incomplete. Please complete your company profile first.");
        setIsCreateProjectDialogOpen(false);
        router.push("/dashboard/account");
        return;
      }

      const data = await createProjectAPI(projectData, clientId, companyId);
      const newProject = data.project;

      addProject(newProject);
      setActiveProject(newProject);
      setIsCreateProjectDialogOpen(false);
      toast.success("Project created successfully");
      router.push("/dashboard/projects");
    } catch (error: unknown) {
      console.error("Error creating project:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create project");
      }
    } finally {
      setIsCreating(false);
    }
  }

  if (!canCreateProject) return null;

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Create Project"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                onClick={handleCreateProjectClick}
                disabled={isCreating}
              >
                <PlusCircleIcon />
                <span>Create Project</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <CreateProjectDialog
        open={isCreateProjectDialogOpen}
        onOpenChange={setIsCreateProjectDialogOpen}
        onSubmit={handleCreateProject}
        isSubmitting={isCreating}
      />
    </>
  );
}
