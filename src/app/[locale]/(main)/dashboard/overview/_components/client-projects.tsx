"use client";

import { FolderKanban } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Project {
  id: string;
  name: string;
  progress: number;
  status: string;
  picName: string;
}

interface ClientProjectsProps {
  projects: Project[];
}

export function ClientProjects({ projects }: ClientProjectsProps) {
  const t = useTranslations("ClientProjects");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="size-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="w-full space-y-3">
          {projects.length > 0 ? (
            projects.map(project => (
              <div
                key={project.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  project.status === "completed"
                    ? "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20"
                    : project.status === "in_progress"
                      ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"
                      : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                }`}
              >
                <div>
                  <div className="font-medium">{project.name}</div>
                  <div className="text-muted-foreground text-sm">{project.progress}% complete</div>
                  <div className="text-muted-foreground text-xs">PIC: {project.picName}</div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    project.status === "completed"
                      ? "text-gray-600"
                      : project.status === "in_progress"
                        ? "text-blue-600"
                        : "text-green-600"
                  }
                >
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground py-4 text-center">{t("noProjects")}</div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
