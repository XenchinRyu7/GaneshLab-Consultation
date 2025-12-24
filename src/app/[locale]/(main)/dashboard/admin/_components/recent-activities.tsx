"use client";

import { Activity } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AnalyticsData } from "./types";

interface RecentActivitiesProps {
  analytics: AnalyticsData | null;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString("id-ID");
};

export function RecentActivities({ analytics }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activities
        </CardTitle>
        <CardDescription>Latest system activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analytics?.recentActivities.map(activity => (
            <div key={activity.id} className="flex items-start space-x-4 rounded-lg border p-4">
              <div className="bg-primary mt-2 h-2 w-2 rounded-full"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {activity.user?.fullname ?? "System"} - {activity.action}
                  </p>
                  <Badge variant={activity.success ? "default" : "destructive"}>
                    {activity.success ? "Success" : "Failed"}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {activity.entityType} • {formatDate(activity.createdAt)}
                </p>
                {activity.details && (
                  <pre className="text-muted-foreground mt-2 text-xs">
                    {JSON.stringify(activity.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
