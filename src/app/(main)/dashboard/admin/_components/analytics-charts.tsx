"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AnalyticsData } from "./types";

interface AnalyticsChartsProps {
  analytics: AnalyticsData | null;
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity Trend</CardTitle>
        <CardDescription>Daily active users over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analytics?.charts.userActivity ?? []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={value =>
                new Date(value).toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={value => new Date(value).toLocaleDateString("id-ID")}
              formatter={value => [value, "Active Users"]}
            />
            <Bar dataKey="active_users" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
