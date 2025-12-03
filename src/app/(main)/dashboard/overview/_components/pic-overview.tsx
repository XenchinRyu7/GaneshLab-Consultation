"use client";

import { useEffect, useState } from "react";

import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PicStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  activeProjects: number;
  availableSlots: number;
  totalClients: number;
  revenueThisMonth: number;
  pendingRequests: number;
  todaysAppointments: number;
  confirmedToday: number;
  pendingToday: number;
  clientSatisfaction: number;
  totalReviews: number;
  todaysAppointmentsDetails: Array<{
    id: string;
    title: string;
    startTime: string;
    status: string;
    client: {
      fullname: string;
    };
  }>;
  pendingProjectApprovals: number;
  pendingRescheduleRequests: number;
  revenueChartData: Array<{
    month: string;
    revenue: number;
  }>;
}

export function PicOverview() {
  const [stats, setStats] = useState<PicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPicStats = async () => {
      try {
        const response = await fetch("/api/pic/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch PIC stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPicStats();
  }, []);

  if (loading) {
    return <div>Loading PIC dashboard...</div>;
  }

  if (!stats) {
    return <div>Failed to load PIC statistics</div>;
  }

  return (
    <>
      {/* PIC-specific metrics */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Today&apos;s Appointments</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.todaysAppointments}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <Calendar />
                {stats.confirmedToday} confirmed
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">Appointments scheduled today</div>
            <div className="text-muted-foreground">{stats.pendingToday} pending confirmation</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Projects</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.activeProjects}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">Projects you&apos;re managing</div>
            <div className="text-muted-foreground">Currently active projects</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Availability Slots</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.availableSlots}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <Clock />
                Available
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">Open consultation slots</div>
            <div className="text-muted-foreground">Next 30 days</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Client Satisfaction</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.clientSatisfaction}/5
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-green-600">
                <CheckCircle />
                Excellent
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">Average rating this month</div>
            <div className="text-muted-foreground">Based on {stats.totalReviews} reviews</div>
          </CardFooter>
        </Card>
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>
              Your revenue from completed projects over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={value => [`$${value.toLocaleString()}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* PIC-specific sections */}
      <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription>Your appointments and meetings for today</CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="w-full space-y-3">
              {stats.todaysAppointmentsDetails.length > 0 ? (
                stats.todaysAppointmentsDetails.slice(0, 3).map(appointment => (
                  <div
                    key={appointment.id}
                    className="bg-muted/50 flex items-center justify-between rounded-lg p-3"
                  >
                    <div>
                      <div className="font-medium">
                        {appointment.startTime} - {appointment.title}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        Client: {appointment.client.fullname}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        appointment.status === "confirmed"
                          ? "text-green-600"
                          : appointment.status === "pending"
                            ? "text-orange-600"
                            : "text-gray-600"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground py-4 text-center">
                  No appointments scheduled for today
                </div>
              )}
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5" />
              Pending Actions
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="w-full space-y-3">
              {stats.pendingProjectApprovals > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/20">
                  <div>
                    <div className="font-medium">Project Approvals Needed</div>
                    <div className="text-muted-foreground text-sm">
                      {stats.pendingProjectApprovals} projects waiting
                    </div>
                  </div>
                  <Badge variant="outline" className="text-orange-600">
                    Urgent
                  </Badge>
                </div>
              )}
              {stats.pendingRescheduleRequests > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
                  <div>
                    <div className="font-medium">Reschedule Requests</div>
                    <div className="text-muted-foreground text-sm">
                      {stats.pendingRescheduleRequests} pending requests
                    </div>
                  </div>
                  <Badge variant="outline">Action Needed</Badge>
                </div>
              )}
              {stats.totalReviews > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20">
                  <div>
                    <div className="font-medium">Client Feedback Review</div>
                    <div className="text-muted-foreground text-sm">
                      {stats.totalReviews} completed projects
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    Ready
                  </Badge>
                </div>
              )}
              {stats.pendingProjectApprovals === 0 &&
                stats.pendingRescheduleRequests === 0 &&
                stats.totalReviews === 0 && (
                  <div className="text-muted-foreground py-4 text-center">No pending actions</div>
                )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
