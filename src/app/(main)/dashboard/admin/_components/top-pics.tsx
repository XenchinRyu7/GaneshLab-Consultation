"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AnalyticsData } from "./types";

interface TopPicsProps {
  analytics: AnalyticsData | null;
}

export function TopPics({ analytics }: TopPicsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top PICs by Project Count</CardTitle>
        <CardDescription>Most active PICs with completed/active projects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analytics?.topPics.map((pic, index) => {
            const { _count } = pic;
            return (
              <div key={pic.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{pic.fullname}</p>
                    <p className="text-muted-foreground text-sm">{pic.email}</p>
                  </div>
                </div>
                <Badge variant="secondary">{_count.projectsAsPic} projects</Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
