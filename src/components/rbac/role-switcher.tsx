"use client";

import { useUserStore } from "@/stores/user/user-provider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/types/rbac";

export function RoleSwitcher() {
  // Hanya muncul di development
  if (process.env.NODE_ENV === "production") return null;

  const currentUser = useUserStore((state) => state.currentUser);
  const switchRole = useUserStore((state) => state.switchRole);

  if (!currentUser) return null;

  return (
    <div className="flex items-center gap-2 border-b bg-muted/50 p-2">
      <span className="text-sm text-muted-foreground">Dev Mode:</span>
      <Select value={currentUser.role} onValueChange={(role) => switchRole(role as UserRole)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="client">
            <div className="flex items-center gap-2">
              <span>Client</span>
              <Badge variant="outline" className="text-xs">
                View Only
              </Badge>
            </div>
          </SelectItem>
          <SelectItem value="pm">
            <div className="flex items-center gap-2">
              <span>PM</span>
              <Badge variant="outline" className="text-xs">
                Manage
              </Badge>
            </div>
          </SelectItem>
          <SelectItem value="admin">
            <div className="flex items-center gap-2">
              <span>Admin</span>
              <Badge variant="outline" className="text-xs">
                Full Access
              </Badge>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <span className="text-xs text-muted-foreground">
        {currentUser.name} ({currentUser.email})
      </span>
    </div>
  );
}

