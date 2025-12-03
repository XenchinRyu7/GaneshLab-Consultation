"use client";

import { format } from "date-fns";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { AnalyticsData } from "./types";

interface RecentLoginsProps {
  analytics: AnalyticsData | null;
}

export function RecentLogins({ analytics }: RecentLoginsProps) {
  const recentLogins = analytics?.recentLogins ?? [];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "pic":
        return "default";
      case "client":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Logins</CardTitle>
        <CardDescription>Latest user login activities</CardDescription>
      </CardHeader>
      <CardContent>
        {!analytics ? (
          <div className="text-muted-foreground py-8 text-center">Loading...</div>
        ) : recentLogins.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">No login data available</div>
        ) : (
          <div className="space-y-4">
            {recentLogins.map(login => (
              <div key={login.id} className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {login.user ? getInitials(login.user.fullname) : "??"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-none font-medium">
                    {login.user?.fullname ?? "Unknown User"}
                  </p>
                  <p className="text-muted-foreground text-xs">{login.user?.email ?? "N/A"}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={getRoleBadgeColor(login.user?.role ?? "")}>
                    {login.user?.role ?? "unknown"}
                  </Badge>
                  <p className="text-muted-foreground text-xs">
                    {format(new Date(login.createdAt), "MMM d, HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
