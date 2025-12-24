"use client";

import { KeyMetrics } from "./key-metrics";
import { OverviewCharts } from "./overview-charts";
import { TopPics } from "./top-pics";
import { AnalyticsData } from "./types";

interface OverviewTabProps {
  analytics: AnalyticsData | null;
}

export function OverviewTab({ analytics }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <KeyMetrics analytics={analytics} />

      {/* Charts */}
      <OverviewCharts analytics={analytics} />

      {/* Top PICs */}
      <TopPics analytics={analytics} />
    </div>
  );
}
