"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/user/user-provider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/rbac";

export function RoleSwitcher() {
  const currentUser = useUserStore((state) => state.currentUser);
  const switchRole = useUserStore((state) => state.switchRole);
  const isDevelopmentMode = useUserStore((state) => state.isDevelopmentMode);
  const setDevelopmentMode = useUserStore((state) => state.setDevelopmentMode);

  // Enable development mode by default in dev environment
  useEffect(() => {
    if (!isDevelopmentMode && process.env.NODE_ENV === "development") {
      setDevelopmentMode(true);
    }
  }, [isDevelopmentMode, setDevelopmentMode]);

  // Hanya muncul di development
  if (process.env.NODE_ENV === "production") return null;
  if (!currentUser || !isDevelopmentMode) return null;

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
          <SelectItem value="pic">
            <div className="flex items-center gap-2">
              <span>PIC</span>
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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDevelopmentMode(false)}
        className="ml-auto text-xs"
      >
        Disable Dev Mode
      </Button>
    </div>
  );
}

