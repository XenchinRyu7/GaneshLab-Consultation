"use client";

import { useEffect, useState, useCallback } from "react";

import { Check, ChevronsUpDown, FolderKanban, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useProjectStore } from "@/stores/project/project-provider";
import type { Project } from "@/stores/project/project-store";
import { useUserStore } from "@/stores/user/user-provider";

export function ProjectSelector() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const currentUser = useUserStore(state => state.currentUser);
  const activeProject = useProjectStore(state => state.activeProject);
  const projects = useProjectStore(state => state.projects);
  const setProjects = useProjectStore(state => state.setProjects);
  const setActiveProject = useProjectStore(state => state.setActiveProject);

  const fetchProjects = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        userId: currentUser.id,
        role: currentUser.role,
      });
      const url = `/api/projects?${params.toString()}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects ?? []);
      } else {
        console.error("Failed to fetch projects");
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, setProjects]);

  // Fetch projects on mount and when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser, fetchProjects]);

  // Update active project when projects change (e.g., after new project is created)
  useEffect(() => {
    if (projects.length === 0) {
      return;
    }

    const currentActiveProjectId = activeProject?.id;

    // If active project exists in current projects list, make sure it's synced
    if (currentActiveProjectId) {
      const projectExists = projects.find(p => p.id === currentActiveProjectId);
      if (!projectExists) {
        // Active project no longer exists, set first project
        setActiveProject(projects[0]);
      }
    } else {
      // No active project but projects exist, try to restore from localStorage or set first
      const savedActiveProjectId = localStorage.getItem("activeProjectId");
      if (savedActiveProjectId) {
        const savedProject = projects.find((p: Project) => p.id === savedActiveProjectId);
        if (savedProject) {
          setActiveProject(savedProject);
        } else {
          setActiveProject(projects[0]);
        }
      } else {
        setActiveProject(projects[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  function handleSelectProject(project: Project) {
    setActiveProject(project);
    setOpen(false);
  }

  // Don't render if no user
  if (!currentUser) {
    return null;
  }

  // Show loading state
  if (loading && projects.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading projects...</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Show message if no projects
  if (projects.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled tooltip="No projects available">
            <FolderKanban className="h-4 w-4" />
            <span className="text-muted-foreground">No projects</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              tooltip={activeProject?.name ?? "Select project"}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <FolderKanban className="h-4 w-4" />
              <span className="truncate">{activeProject?.name ?? "Select Project"}</span>
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel>Active Project</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {projects.map(project => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => handleSelectProject(project)}
                className="cursor-pointer"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <FolderKanban className="h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{project.name}</span>
                      <Badge variant="outline" className="shrink-0 text-xs">
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  {activeProject?.id === project.id && (
                    <Check className="text-primary h-4 w-4 shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
