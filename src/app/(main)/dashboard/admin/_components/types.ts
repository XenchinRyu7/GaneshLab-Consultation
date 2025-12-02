export interface UserActivityData {
  date: string;
  active_users: number;
}

export interface ProjectStatusData {
  status: string;
  _count: {
    status: number;
  };
}

export interface RevenueByMonthData {
  month: string;
  revenue: number | null;
}

export interface TopPicData {
  id: string;
  fullname: string;
  email: string;
  _count: {
    projectsAsPic: number;
  };
}

export interface RecentActivityData {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
  user?: {
    fullname: string;
    role: string;
  };
}

export interface AnalyticsData {
  overview: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    totalProjects: number;
    newProjects: number;
    completedProjects: number;
    totalRevenue: number;
    totalAppointments: number;
    completedAppointments: number;
  };
  charts: {
    userActivity: UserActivityData[];
    projectStatus: ProjectStatusData[];
    revenueByMonth: RevenueByMonthData[];
  };
  topPics: TopPicData[];
  recentActivities: RecentActivityData[];
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
  user?: {
    fullname: string;
    email: string;
    role: string;
  };
}

export interface AuditFilters {
  action: string;
  entityType: string;
  userId: string;
  success: string;
  page: number;
  limit: number;
}
