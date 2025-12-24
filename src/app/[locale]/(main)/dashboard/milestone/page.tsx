"use client";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/stores/project/project-provider";

import { MilestoneBoard } from "./_components/milestone-board";

export default function MilestonePage() {
  const activeProject = useProjectStore(state => state.activeProject);

  const isProjectAccessible =
    activeProject && (activeProject.status === "APPROVED" || activeProject.status === "ACTIVE");

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Milestone Board</h1>
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
            Milestone board.
          </p>
        </div>
      )}

      {activeProject && !isProjectAccessible && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Project Not Approved</AlertTitle>
          <AlertDescription>
            Milestone board is only available for approved or active projects. Current status:{" "}
            <strong>{activeProject.status}</strong>
          </AlertDescription>
        </Alert>
      )}

      {activeProject && isProjectAccessible && <MilestoneBoard projectId={activeProject.id} />}
    </div>
  );
}
