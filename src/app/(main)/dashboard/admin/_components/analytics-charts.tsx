"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AnalyticsData } from "./types";

interface AnalyticsChartsProps {
  analytics: AnalyticsData | null;
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const userActivityData = analytics?.charts?.userActivity ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity Trend</CardTitle>
        <CardDescription>Daily active users over time</CardDescription>
      </CardHeader>
      <CardContent>
        {!analytics ? (
          <div className="text-muted-foreground py-8 text-center">Loading...</div>
        ) : userActivityData.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            No user activity data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={userActivityData}>
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
        )}
      </CardContent>
    </Card>
  );
}
