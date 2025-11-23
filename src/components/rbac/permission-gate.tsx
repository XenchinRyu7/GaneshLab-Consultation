"use client";

import { useMemo } from "react";

import { useUserStore } from "@/stores/user/user-provider";
import type { UserState } from "@/stores/user/user-store";
import type { Permission } from "@/types/rbac";

interface PermissionGateProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// Helper to create stable permissions array key
function getPermissionsKey(permission: Permission | Permission[]): string {
  const perms = Array.isArray(permission) ? permission : [permission];
  return [...perms].sort().join(",");
}

export function PermissionGate({
  permission,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  // Create stable permissions key
  const permissionsKey = useMemo(() => getPermissionsKey(permission), [permission]);

  // Create stable selector that doesn't depend on permissions array reference
  const selector = useMemo(
    () => (state: UserState) => {
      // Recreate permissions inside selector to avoid closure issues
      const perms = permissionsKey.split(",") as Permission[];
      if (requireAll) {
        return state.hasAllPermissions(perms);
      }
      return state.hasAnyPermission(perms);
    },
    [permissionsKey, requireAll]
  );

  const hasAccess = useUserStore(selector);

  if (!hasAccess) return <>{fallback}</>;
  return <>{children}</>;
}
