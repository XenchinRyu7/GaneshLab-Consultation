"use client";

import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/stores/project/project-provider";

import { KanbanBoard } from "./_components/kanban-board";

export default function KanbanPage() {
  const activeProject = useProjectStore(state => state.activeProject);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Kanban Board</h1>
            {activeProject && (
              <Badge variant="outline" className="text-sm">
                {activeProject.name}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {activeProject
              ? `Manage and track tasks for ${activeProject.name}`
              : "Manage and track your tasks with a visual board. Select a project to filter tasks."}
          </p>
        </div>
      </div>
      {!activeProject && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No active project selected. Please select a project from the Projects page to view its
            kanban board.
          </p>
        </div>
      )}
      {activeProject && <KanbanBoard />}
    </div>
  );
}
