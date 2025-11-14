"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { useStore, type StoreApi } from "zustand";

import { createProjectStore, type ProjectState, type Project } from "./project-store";

const ProjectStoreContext = createContext<StoreApi<ProjectState> | null>(null);

export const ProjectStoreProvider = ({
  children,
  initialProjects,
  initialActiveProject,
}: {
  children: React.ReactNode;
  initialProjects?: Project[];
  initialActiveProject?: Project | null;
}) => {
  // Create store once during initial render using props. We'll sync active project from localStorage on mount.
  const [store] = useState<StoreApi<ProjectState>>(() =>
    createProjectStore({
      projects: initialProjects ?? [],
      activeProject: initialActiveProject ?? null,
    })
  );

  // Sync active project from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedActiveProjectId = localStorage.getItem("activeProjectId");
      if (savedActiveProjectId) {
        const projects = store.getState().projects;
        const savedProject = projects.find(p => p.id === savedActiveProjectId);
        if (savedProject) {
          store.getState().setActiveProject(savedProject);
        }
      }
    }
  }, [store]);

  return <ProjectStoreContext.Provider value={store}>{children}</ProjectStoreContext.Provider>;
};

export const useProjectStore = <T,>(selector: (state: ProjectState) => T): T => {
  const store = useContext(ProjectStoreContext);
  if (!store) {
    throw new Error("useProjectStore must be used within ProjectStoreProvider");
  }
  return useStore(store, selector);
};
