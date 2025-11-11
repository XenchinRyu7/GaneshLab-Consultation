"use client";

import { createContext, useContext, useRef, useEffect } from "react";
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
  const storeRef = useRef<StoreApi<ProjectState> | null>(null);

  // Initialize store
  if (!storeRef.current) {
    // Try to restore active project from localStorage on client side
    let activeProject = initialActiveProject ?? null;
    if (typeof window !== "undefined") {
      const savedActiveProjectId = localStorage.getItem("activeProjectId");
      if (savedActiveProjectId && initialProjects) {
        activeProject = initialProjects.find((p) => p.id === savedActiveProjectId) ?? null;
      }
    }

    storeRef.current = createProjectStore({
      projects: initialProjects ?? [],
      activeProject,
    });
  }

  // Sync active project from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && storeRef.current) {
      const savedActiveProjectId = localStorage.getItem("activeProjectId");
      if (savedActiveProjectId) {
        const projects = storeRef.current.getState().projects;
        const savedProject = projects.find((p) => p.id === savedActiveProjectId);
        if (savedProject) {
          storeRef.current.getState().setActiveProject(savedProject);
        }
      }
    }
  }, []);

  return (
    <ProjectStoreContext.Provider value={storeRef.current}>{children}</ProjectStoreContext.Provider>
  );
};

export const useProjectStore = <T,>(selector: (state: ProjectState) => T): T => {
  const store = useContext(ProjectStoreContext);
  if (!store) {
    throw new Error("useProjectStore must be used within ProjectStoreProvider");
  }
  return useStore(store, selector);
};

