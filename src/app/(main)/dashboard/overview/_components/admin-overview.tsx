"use client";

import { useEffect, useState } from "react";

import { Users, Building2, TrendingUp, Activity } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  activeProjects: number;
  systemHealth: number;
  activePics: number;
  activeClients: number;
  newThisMonth: number;
  totalCompanies: number;
  completedThisMonth: number;
  pendingApprovals: number;
  projectChartData: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  revenueChartData: Array<{
    month: string;
    revenue: number;
  }>;
}

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <div>Loading admin dashboard...</div>;
  }

  if (!stats) {
    return <div>Failed to load admin statistics</div>;
  }

  return (
    <>
      {/* Admin-specific metrics */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.totalUsers.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingUp />+{((stats.newThisMonth / stats.totalUsers) * 100).toFixed(1)}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              New registrations this month <TrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">Active user growth</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${stats.totalRevenue.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingUp />
                +12.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Revenue growth <TrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">Monthly recurring revenue</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Active Projects</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.activeProjects}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <Activity />
                {Math.floor(stats.activeProjects * 0.13)} in progress
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">Projects currently active</div>
            <div className="text-muted-foreground">Across all PICs and clients</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>System Health</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.systemHealth}%
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-green-600">
                <Activity />
                Excellent
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">Uptime this month</div>
            <div className="text-muted-foreground">System reliability</div>
          </CardFooter>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>Overview of projects by status</CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.projectChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.projectChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>
              Revenue from completed projects over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={value => [`$${value.toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Admin-specific sections */}
      <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              User Management
            </CardTitle>
            <CardDescription>Recent user activities and statistics</CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Users:</span>
                <span className="font-medium">{stats.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active PICs:</span>
                <span className="font-medium">{stats.activePics}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active Clients:</span>
                <span className="font-medium">{stats.activeClients}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>New This Month:</span>
                <span className="font-medium text-green-600">+{stats.newThisMonth}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Company Overview
            </CardTitle>
            <CardDescription>Company registrations and project statistics</CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Companies:</span>
                <span className="font-medium">{stats.totalCompanies}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active Projects:</span>
                <span className="font-medium">{stats.activeProjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completed This Month:</span>
                <span className="font-medium text-green-600">{stats.completedThisMonth}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending Approvals:</span>
                <span className="font-medium text-orange-600">{stats.pendingApprovals}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
