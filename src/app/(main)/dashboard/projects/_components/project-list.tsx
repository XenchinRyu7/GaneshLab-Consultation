"use client";

import { Pencil, Trash2, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProjectStore } from "@/stores/project/project-provider";
import type { Project, ProjectStatus } from "@/stores/project/project-store";

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onCreateNew: () => void;
  userRole?: string;
}

const statusColors: Record<ProjectStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  APPROVED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DECLINED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ON_MAINTAIN: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function formatStatus(status: ProjectStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending Approval";
    case "APPROVED":
      return "Approved";
    case "DECLINED":
      return "Declined";
    case "ACTIVE":
      return "Active";
    case "COMPLETED":
      return "Completed";
    case "ON_MAINTAIN":
      return "On Maintain";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export function ProjectList({
  projects,
  onEdit,
  onDelete,
  onCreateNew,
  userRole,
}: ProjectListProps) {
  const activeProject = useProjectStore(state => state.activeProject);
  const setActiveProject = useProjectStore(state => state.setActiveProject);

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold">No projects yet</h3>
            <p className="text-muted-foreground">Get started by creating your first project</p>
            <Button onClick={onCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map(project => {
        const isActive = activeProject?.id === project.id;

        return (
          <Card
            key={project.id}
            className={`cursor-pointer transition-all hover:shadow-md ${isActive ? "ring-primary ring-2" : ""}`}
            onClick={() => setActiveProject(project)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge className={statusColors[project.status]}>
                  {formatStatus(project.status)}
                </Badge>
              </div>
              {project.description && (
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">PIC:</span>{" "}
                  <span className="font-medium">{project.pic?.fullname ?? "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Client:</span>{" "}
                  <span className="font-medium">{project.client?.fullname ?? "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Progress:</span>{" "}
                  <span className="font-medium">{project.progress}%</span>
                </div>
              </div>
              {isActive && (
                <Badge variant="outline" className="mt-3">
                  Active Project
                </Badge>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              {userRole === "client" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    onEdit(project);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  onDelete(project.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
