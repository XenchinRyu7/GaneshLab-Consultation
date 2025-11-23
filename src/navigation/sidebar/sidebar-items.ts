import {
  MessageSquare,
  Calendar,
  Kanban,
  Users,
  Lock,
  Fingerprint,
  LayoutDashboard,
  FolderKanban,
  Clock,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  roles?: ("admin" | "pic" | "client")[]; // Optional: filter by role
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  roles?: ("admin" | "pic" | "client")[]; // Optional: filter by role
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Default",
        url: "/dashboard/default",
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
            roles: ["pic", "admin"], // Only visible for PIC and Admin
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
      {
        title: "Users",
        url: "/dashboard/user",
        icon: Users,
        roles: ["admin"], // Only visible for Admin
      },
      {
        title: "Roles",
        url: "/dashboard/coming-soon",
        icon: Lock,
        comingSoon: true,
      },
    ],
  },
];
