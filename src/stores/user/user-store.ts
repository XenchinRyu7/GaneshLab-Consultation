import { createStore } from "zustand/vanilla";

import type { UserRole, Permission } from "@/types/rbac";
import { rolePermissions } from "@/types/rbac";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
};

export type UserState = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isAdmin: () => boolean;
  isPM: () => boolean;
  isClient: () => boolean;
};

// Mock users untuk development
const mockUsers: Record<UserRole, User> = {
  admin: {
    id: "admin-1",
    name: "Admin System",
    email: "admin@ganeshlab.com",
    role: "admin",
    avatar: "/avatars/admin.png",
  },
  pm: {
    id: "pm-1",
    name: "John PM",
    email: "pm@ganeshlab.com",
    role: "pm",
    avatar: "/avatars/pm.png",
  },
  client: {
    id: "client-1",
    name: "Client ABC",
    email: "client@example.com",
    role: "client",
    avatar: "/avatars/client.png",
  },
};

export const createUserStore = (init?: Partial<UserState>) =>
  createStore<UserState>()((set, get) => ({
    currentUser: init?.currentUser ?? mockUsers.client,

    setCurrentUser: (user) => set({ currentUser: user }),

    switchRole: (role) => set({ currentUser: mockUsers[role] }),

    hasPermission: (permission) => {
      const user = get().currentUser;
      if (!user) return false;
      const permissions = rolePermissions[user.role];
      return permissions.includes(permission);
    },

    hasAnyPermission: (permissions) => {
      return permissions.some((perm) => get().hasPermission(perm));
    },

    hasAllPermissions: (permissions) => {
      return permissions.every((perm) => get().hasPermission(perm));
    },

    isAdmin: () => get().currentUser?.role === "admin",
    isPM: () => get().currentUser?.role === "pm",
    isClient: () => get().currentUser?.role === "client",
  }));

