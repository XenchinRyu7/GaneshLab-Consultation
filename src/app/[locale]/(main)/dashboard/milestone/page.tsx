"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/stores/project/project-provider";

import { MilestoneBoard } from "./_components/milestone-board";

export default function MilestonePage() {
  const t = useTranslations();
  const activeProject = useProjectStore(state => state.activeProject);

  const isProjectAccessible =
    activeProject && (activeProject.status === "APPROVED" || activeProject.status === "ACTIVE");

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{t("MilestonePage.title")}</h1>
            {activeProject && (
              <Badge variant="outline" className="text-sm">
                {activeProject.name}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {activeProject
              ? t("MilestonePage.descriptionWithProject", { projectName: activeProject.name })
              : t("MilestonePage.descriptionWithoutProject")}
          </p>
        </div>
      </div>

      {!activeProject && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">{t("MilestonePage.noProjectSelected")}</p>
        </div>
      )}

      {activeProject && !isProjectAccessible && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("MilestonePage.projectNotApproved")}</AlertTitle>
          <AlertDescription>
            {t("MilestonePage.projectNotApprovedDescription", { status: activeProject.status })}
          </AlertDescription>
        </Alert>
      )}

      {activeProject && isProjectAccessible && <MilestoneBoard projectId={activeProject.id} />}
    </div>
  );
}
