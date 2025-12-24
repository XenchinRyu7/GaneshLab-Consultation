"use client";

import { useState } from "react";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { OverviewTab, AuditLogsTab, AnalyticsTab, useAnalytics, useAuditLogs } from "./_components";

export default function AdminDashboard() {
  const t = useTranslations("Admin");
  const { analytics, loading } = useAnalytics();
  const { auditLogs, loading: auditLoading, filters, setFilters } = useAuditLogs();
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleExportReport = async () => {
    try {
      setExporting(true);

      if (activeTab === "audit-logs") {
        // Export audit logs as CSV
        exportAuditLogsToCSV(auditLogs);
      } else {
        // Export analytics overview as CSV
        exportAnalyticsToCSV(analytics);
      }

      toast.success(t("reportExportedSuccess"));
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("reportExportFailed"));
    } finally {
      setExporting(false);
    }
  };

  const exportAuditLogsToCSV = (logs: typeof auditLogs) => {
    const headers = [
      t("csvHeaders.date"),
      t("csvHeaders.user"),
      t("csvHeaders.action"),
      t("csvHeaders.entityType"),
      t("csvHeaders.status"),
      t("csvHeaders.details"),
    ];
    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleString(),
      log.user?.fullname ?? t("system"),
      log.action,
      log.entityType,
      log.success ? "Success" : "Failed",
      log.errorMessage ?? "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    downloadCSV(csvContent, "audit-logs-report.csv");
  };

  const exportAnalyticsToCSV = (data: typeof analytics) => {
    if (!data) return;

    const headers = ["Metric", "Value"];
    const rows = [
      ["Total Users", data.overview.totalUsers],
      ["New Users", data.overview.newUsers],
      ["Active Users", data.overview.activeUsers],
      ["Total Projects", data.overview.totalProjects],
      ["New Projects", data.overview.newProjects],
      ["Completed Projects", data.overview.completedProjects],
      ["Total Appointments", data.overview.totalAppointments],
      ["Completed Appointments", data.overview.completedAppointments],
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    downloadCSV(csvContent, "analytics-report.csv");
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportReport} disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? t("exporting") : t("exportReport")}
        </Button>
      </div>

      <Tabs
        defaultValue="overview"
        className="space-y-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="audit-logs">{t("auditLogs")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("analytics")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab analytics={analytics} />
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-6">
          <AuditLogsTab
            auditLogs={auditLogs}
            loading={auditLoading}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab analytics={analytics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
