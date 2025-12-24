"use client";

import { Bell, CheckCheck, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "@/i18n/routing";

import { useNotifications } from "./notification-context";
import { NotificationItem } from "./notification-item";

export function NotificationDropdown() {
  const router = useRouter();
  const t = useTranslations("Notifications");
  const { notifications, unreadCount, isLoading, markAllAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex size-5 items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t("dropdownTitle")}</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                markAllAsRead();
                toast.success(t("allMarkedAsReadToast"));
              }}
            >
              <CheckCheck className="mr-1 size-4" />
              {t("markAllRead")}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="text-muted-foreground p-4 text-center text-sm">
            {t("loadingNotifications")}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="text-muted-foreground/50 mx-auto mb-2 size-12" />
            <p className="text-sm font-medium">{t("noNotificationsDropdown")}</p>
            <p className="text-muted-foreground mt-1 text-xs">{t("allCaughtUp")}</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 p-1">
              {notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </ScrollArea>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard/notifications")}>
            <Settings className="mr-2 size-4" />
            {t("viewAllNotifications")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
