"use client";

import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AnalyticsData } from "./types";

interface OverviewChartsProps {
  analytics: AnalyticsData | null;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function OverviewCharts({ analytics }: OverviewChartsProps) {
  const projectStatusData = analytics?.charts.projectStatus ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Status Distribution</CardTitle>
        <CardDescription>Current status of all projects</CardDescription>
      </CardHeader>
      <CardContent>
        {!analytics ? (
          <div className="text-muted-foreground py-8 text-center">Loading...</div>
        ) : projectStatusData.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">No project data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="_count.status"
              >
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${entry.status}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
