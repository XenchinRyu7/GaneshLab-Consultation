"use client";

import { AnalyticsCharts } from "./analytics-charts";
import { RecentActivities } from "./recent-activities";
import { RecentLogins } from "./recent-logins";
import { AnalyticsData } from "./types";

interface AnalyticsTabProps {
  analytics: AnalyticsData | null;
}

export function AnalyticsTab({ analytics }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      {/* User Activity Chart */}
      <AnalyticsCharts analytics={analytics} />

      {/* Recent Logins and Activities in 2 columns */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentLogins analytics={analytics} />
        <RecentActivities analytics={analytics} />
      </div>
    </div>
  );
}
