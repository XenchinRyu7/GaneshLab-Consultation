"use client";

import { Calendar, MessageSquare, FolderKanban, Clock, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "@/i18n/routing";

export function ClientQuickActions() {
  const t = useTranslations("QuickActions");
  const router = useRouter();

  const handleScheduleMeeting = () => {
    router.push("/dashboard/appointment");
  };

  const handleContactPIC = () => {
    router.push("/dashboard/chat");
  };

  const handleViewProjects = () => {
    router.push("/dashboard/projects");
  };

  const handleViewCalendar = () => {
    router.push("/dashboard/appointment");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="size-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={handleScheduleMeeting}
            className="border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 flex flex-col items-center gap-2 rounded-lg border border-dashed p-4 transition-colors"
          >
            <Calendar className="size-6" />
            <span className="text-sm font-medium">{t("scheduleMeeting")}</span>
          </button>
          <button
            onClick={handleContactPIC}
            className="border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 flex flex-col items-center gap-2 rounded-lg border border-dashed p-4 transition-colors"
          >
            <MessageSquare className="size-6" />
            <span className="text-sm font-medium">{t("contactPIC")}</span>
          </button>
          <button
            onClick={handleViewProjects}
            className="border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 flex flex-col items-center gap-2 rounded-lg border border-dashed p-4 transition-colors"
          >
            <FolderKanban className="size-6" />
            <span className="text-sm font-medium">{t("viewProjects")}</span>
          </button>
          <button
            onClick={handleViewCalendar}
            className="border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 flex flex-col items-center gap-2 rounded-lg border border-dashed p-4 transition-colors"
          >
            <Clock className="size-6" />
            <span className="text-sm font-medium">{t("viewCalendar")}</span>
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
