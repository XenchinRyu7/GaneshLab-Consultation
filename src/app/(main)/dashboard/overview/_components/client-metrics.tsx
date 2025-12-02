"use client";

import { Calendar, FolderKanban, CheckCircle, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ClientStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  upcomingAppointments: number;
  unreadMessages: number;
  totalMessages: number;
  overallProgress: number;
  nextAppointmentDate: string;
  nextAppointmentPIC: string;
}

interface ClientMetricsProps {
  stats: ClientStats;
}

export function ClientMetrics({ stats }: ClientMetricsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>My Projects</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalProjects}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <FolderKanban className="size-4" />
              {stats.activeProjects} active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Projects you&apos;re working on</div>
          <div className="text-muted-foreground">
            {stats.completedProjects} completed this month
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Upcoming Meetings</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.upcomingAppointments}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Calendar className="size-4" />
              Next: {stats.nextAppointmentDate || "None"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Scheduled consultations</div>
          <div className="text-muted-foreground">With your PIC</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Messages</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalMessages}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <MessageSquare className="size-4" />
              {stats.unreadMessages} unread
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Messages from your PIC</div>
          <div className="text-muted-foreground">Check chat for updates</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Project Progress</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.overallProgress}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="size-4" />
              On Track
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Overall completion rate</div>
          <div className="text-muted-foreground">Across all projects</div>
        </CardFooter>
      </Card>
    </div>
  );
}
