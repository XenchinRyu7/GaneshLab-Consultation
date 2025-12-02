"use client";

import { Users, FileText, DollarSign, Calendar } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { AnalyticsData } from "./types";

interface KeyMetricsProps {
  analytics: AnalyticsData | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function KeyMetrics({ analytics }: KeyMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.overview.totalUsers ?? 0}</div>
          <p className="text-muted-foreground text-xs">
            +{analytics?.overview.newUsers ?? 0} new this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <FileText className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.overview.totalProjects ?? 0}</div>
          <p className="text-muted-foreground text-xs">
            +{analytics?.overview.newProjects ?? 0} new this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(analytics?.overview.totalRevenue ?? 0)}
          </div>
          <p className="text-muted-foreground text-xs">From completed projects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Appointments</CardTitle>
          <Calendar className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.overview.totalAppointments ?? 0}</div>
          <p className="text-muted-foreground text-xs">
            {analytics?.overview.completedAppointments ?? 0} completed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
