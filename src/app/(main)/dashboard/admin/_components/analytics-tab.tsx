"use client";

import { AnalyticsCharts } from "./analytics-charts";
import { RecentActivities } from "./recent-activities";
import { AnalyticsData } from "./types";

interface AnalyticsTabProps {
  analytics: AnalyticsData | null;
}

export function AnalyticsTab({ analytics }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      {/* User Activity Chart */}
      <AnalyticsCharts analytics={analytics} />

      {/* Recent Activities */}
      <RecentActivities analytics={analytics} />
    </div>
  );
}
