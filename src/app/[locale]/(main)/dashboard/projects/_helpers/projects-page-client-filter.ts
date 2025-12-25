/**
 * Client filtering utilities for Projects page
 */

import type { Project } from "@/stores/project/project-store";

/**
 * Extract unique clients from projects
 */
export function getUniqueClients(projects: Project[]) {
  return Array.from(
    new Map(
      projects
        .filter(p => p.client) // Filter out projects without client
        .map(p => [p.client!.id, p.client!])
    ).values()
  );
}

/**
 * Filter projects by client ID
 */
export function filterProjectsByClient(projects: Project[], selectedClientId: string) {
  if (selectedClientId === "all") {
    return projects;
  }
  return projects.filter(p => p.client?.id === selectedClientId);
}

/**
 * Get project count for a specific client
 */
export function getClientProjectCount(projects: Project[], clientId: string) {
  return projects.filter(p => p.client?.id === clientId).length;
}
