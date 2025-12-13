import { createStore } from "zustand/vanilla";

import { rolePermissions, type UserRole, type Permission } from "@/types/rbac";

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
  isPIC: () => boolean;
  isClient: () => boolean;
  // Development only - untuk role switcher
  isDevelopmentMode: boolean;
  setDevelopmentMode: (enabled: boolean) => void;
};

export const createUserStore = (init?: Partial<UserState>) =>
  createStore<UserState>()((set, get) => ({
    currentUser: init?.currentUser ?? null,
    isDevelopmentMode: init?.isDevelopmentMode ?? false,

    setCurrentUser: user => set({ currentUser: user }),

    setDevelopmentMode: enabled => set({ isDevelopmentMode: enabled }),

    switchRole: role => {
      // Hanya bisa switch role di development mode
      if (get().isDevelopmentMode && get().currentUser) {
        set({
          currentUser: {
            ...get().currentUser!,
            role,
          },
        });
      }
    },

    hasPermission: permission => {
      const user = get().currentUser;
      if (!user) return false;
      const permissions = rolePermissions[user.role];
      return permissions.includes(permission);
    },

    hasAnyPermission: permissions => {
      return permissions.some(perm => get().hasPermission(perm));
    },

    hasAllPermissions: permissions => {
      return permissions.every(perm => get().hasPermission(perm));
    },

    isAdmin: () => get().currentUser?.role === "admin",
    isPIC: () => get().currentUser?.role === "pic",
    isClient: () => get().currentUser?.role === "client",
  }));
