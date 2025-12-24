"use client";

import { useState, useEffect, useCallback } from "react";

import { AnalyticsData, AuditLog, AuditFilters } from "./types";

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      console.log("Fetching analytics from /api/admin/analytics...");
      const response = await fetch("/api/admin/analytics");
      console.log("Response status:", response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log("Analytics data received:");
        console.log("- Overview:", data.overview);
        console.log("- Charts.userActivity count:", data.charts?.userActivity?.length ?? 0);
        console.log("- Charts.userActivity sample:", data.charts?.userActivity?.slice(0, 2));
        console.log("- Charts.projectStatus count:", data.charts?.projectStatus?.length ?? 0);
        console.log("- TopPics count:", data.topPics?.length ?? 0);
        console.log("- TopPics data:", data.topPics);
        console.log("- RecentActivities count:", data.recentActivities?.length ?? 0);
        setAnalytics(data);
      } else {
        console.error("Failed to fetch analytics:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { analytics, loading, refetch: fetchAnalytics };
}

export function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AuditFilters>({
    action: "",
    entityType: "",
    userId: "",
    success: "",
    page: 1,
    limit: 50,
  });

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/audit-logs?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.auditLogs);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return { auditLogs, loading, filters, setFilters, refetch: fetchAuditLogs };
}
