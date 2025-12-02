import {
  MessageSquare,
  Calendar,
  Kanban,
  Users,
  Fingerprint,
  LayoutDashboard,
  FolderKanban,
  Clock,
  Shield,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  roles?: ("admin" | "pic" | "client")[];
}

export interface NavMainItem {
  title: string;
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
  items: NavMainItem[];
  roles?: ("admin" | "pic" | "client")[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Overview",
        url: "/dashboard/overview",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 2,
    label: "Pages",
    items: [
      {
        title: "Chat",
        url: "/dashboard/chat",
        icon: MessageSquare,
      },
      {
        title: "Projects",
        url: "/dashboard/projects",
        icon: FolderKanban,
        subItems: [
          {
            title: "All Projects",
            url: "/dashboard/projects",
            icon: FolderKanban,
          },
          {
            title: "Project Approvals",
            url: "/dashboard/projects/approvals",
            icon: Fingerprint,
            roles: ["pic", "admin"],
          },
        ],
      },
      {
        title: "Appointment",
        url: "/dashboard/appointment",
        icon: Calendar,
      },
      {
        title: "Availability",
        url: "/dashboard/availability",
        icon: Clock,
        roles: ["pic", "admin"], // Only visible for PIC and Admin
      },
      {
        title: "Kanban",
        url: "/dashboard/kanban",
        icon: Kanban,
      },
    ],
  },
  {
    id: 3,
    label: "Administration",
    roles: ["admin"], // Only visible for Admin
    items: [
      {
        title: "Admin Dashboard",
        url: "/dashboard/admin",
        icon: Shield,
        roles: ["admin"],
        subItems: [
          {
            title: "Overview",
            url: "/dashboard/admin",
            icon: Shield,
          },
          {
            title: "Audit Logs",
            url: "/dashboard/admin#audit-logs",
            icon: Shield,
          },
          {
            title: "Analytics",
            url: "/dashboard/admin#analytics",
            icon: BarChart3,
          },
        ],
      },
      {
        title: "User Management",
        url: "/dashboard/admin/users",
        icon: Users,
        roles: ["admin"],
      },
    ],
  },
];
