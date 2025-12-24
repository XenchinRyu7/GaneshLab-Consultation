"use client";

import { useEffect, useState } from "react";

import { Users, Building2, TrendingUp, Activity } from "lucide-react";
import { useTranslations } from "next-intl";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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
}

export function AdminOverview() {
  const t = useTranslations("Dashboard");
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
    return <div>{t("loadingAdminDashboard")}</div>;
  }

  if (!stats) {
    return <div>{t("failedLoadAdminStats")}</div>;
  }

  return (
    <>
      {/* Admin-specific metrics */}
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t("totalUsers")}</CardDescription>
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
              {t("newRegistrationsThisMonth")} <TrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">{t("activeUserGrowth")}</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t("activeProjects")}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.activeProjects}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {t("projectsCurrentlyActive")}
            </div>
            <div className="text-muted-foreground">{t("acrossAllPicsAndClients")}</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t("totalCompanies")}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.totalCompanies}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">{t("registeredCompanies")}</div>
            <div className="text-muted-foreground">{t("businessClients")}</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>{t("systemHealth")}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stats.systemHealth}%
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="text-green-600">
                <Activity />
                {t("excellent")}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">{t("uptimeThisMonth")}</div>
            <div className="text-muted-foreground">{t("systemReliability")}</div>
          </CardFooter>
        </Card>
      </div>

      {/* Charts section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("projectStatusDistribution")}</CardTitle>
          <CardDescription>{t("overviewOfProjectsByStatus")}</CardDescription>
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

      {/* Admin-specific sections */}
      <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              {t("userManagement")}
            </CardTitle>
            <CardDescription>{t("recentUserActivitiesAndStatistics")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("totalUsers")}:</span>
                <span className="font-medium">{stats.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("activePics")}:</span>
                <span className="font-medium">{stats.activePics}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("activeClients")}:</span>
                <span className="font-medium">{stats.activeClients}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("newThisMonth")}:</span>
                <span className="font-medium text-green-600">+{stats.newThisMonth}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              {t("companyOverview")}
            </CardTitle>
            <CardDescription>{t("companyRegistrationsAndProjectStatistics")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("totalCompanies")}:</span>
                <span className="font-medium">{stats.totalCompanies}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("activeProjects")}:</span>
                <span className="font-medium">{stats.activeProjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("completedThisMonth")}:</span>
                <span className="font-medium text-green-600">{stats.completedThisMonth}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t("pendingApprovals")}:</span>
                <span className="font-medium text-orange-600">{stats.pendingApprovals}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
