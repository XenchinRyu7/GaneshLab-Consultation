import {
  MessageSquare,
  Calendar,
  Target,
  Users,
  Fingerprint,
  LayoutDashboard,
  Folder,
  Clock,
  Shield,
  BarChart3,
  UserPlus,
  Bell,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  titleKey?: string; // Translation key for next-intl
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  roles?: ("admin" | "pic" | "client")[];
}

export interface NavMainItem {
  title: string;
  titleKey?: string; // Translation key for next-intl
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  roles?: ("admin" | "pic" | "client")[];
}

export interface NavGroup {
  id: number;
  label?: string;
  labelKey?: string; // Translation key for next-intl
  items: NavMainItem[];
  roles?: ("admin" | "pic" | "client")[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    labelKey: "Sidebar.dashboards",
    items: [
      {
        title: "Overview",
        titleKey: "Sidebar.overview",
        url: "/dashboard/overview",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Pages",
    labelKey: "Sidebar.pages",
    items: [
      {
        title: "Notifications",
        titleKey: "Sidebar.notifications",
        url: "/dashboard/notifications",
        icon: Bell,
        isNew: true,
      },
      {
        title: "Chat",
        titleKey: "Sidebar.chat",
        url: "/dashboard/chat",
        icon: MessageSquare,
      },
      {
        title: "Projects",
        titleKey: "Sidebar.projects",
        url: "/dashboard/projects",
        icon: Folder,
        subItems: [
          {
            title: "All Projects",
            titleKey: "Sidebar.allProjects",
            url: "/dashboard/projects",
            icon: Folder,
          },
          {
            title: "Project Approvals",
            titleKey: "Sidebar.projectApprovals",
            url: "/dashboard/projects/approvals",
            icon: Fingerprint,
            roles: ["pic", "admin"],
          },
        ],
      },
      {
        title: "Appointment",
        titleKey: "Sidebar.appointment",
        url: "/dashboard/appointment",
        icon: Calendar,
      },
      {
        title: "Availability",
        titleKey: "Sidebar.availability",
        url: "/dashboard/availability",
        icon: Clock,
        roles: ["pic", "admin"],
      },
      {
        title: "Milestone",
        titleKey: "Sidebar.milestone",
        url: "/dashboard/milestone",
        icon: Target,
      },
    ],
  },
  {
    id: 3,
    label: "Administration",
    labelKey: "Sidebar.administration",
    roles: ["admin"], // Only visible for Admin
    items: [
      {
        title: "Admin Dashboard",
        titleKey: "Sidebar.adminDashboard",
        url: "/dashboard/admin",
        icon: Shield,
        roles: ["admin"],
        subItems: [
          {
            title: "Overview",
            titleKey: "Sidebar.overview",
            url: "/dashboard/admin",
            icon: Shield,
          },
          {
            title: "Audit Logs",
            titleKey: "Sidebar.auditLogs",
            url: "/dashboard/admin#audit-logs",
            icon: Shield,
          },
          {
            title: "Analytics",
            titleKey: "Sidebar.analytics",
            url: "/dashboard/admin#analytics",
            icon: BarChart3,
          },
        ],
      },
      {
        title: "User Management",
        titleKey: "Sidebar.userManagement",
        url: "/dashboard/admin/users",
        icon: Users,
        roles: ["admin"],
      },
      {
        title: "Guest Appointments",
        titleKey: "Sidebar.guestAppointments",
        url: "/dashboard/admin/guest-appointments",
        icon: UserPlus,
        roles: ["admin"],
        isNew: true,
      },
    ],
  },
];
