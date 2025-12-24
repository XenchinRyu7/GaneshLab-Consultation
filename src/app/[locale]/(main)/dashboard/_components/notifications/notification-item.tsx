"use client";

import { useState } from "react";

import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  MessageSquare,
  Settings,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

import { useNotifications } from "./notification-context";

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    actionUrl?: string | null;
    createdAt: Date | string;
  };
}

const notificationIcons = {
  INFO: Info,
  SUCCESS: CheckCircle,
  WARNING: AlertTriangle,
  ERROR: XCircle,
  APPOINTMENT: Calendar,
  MESSAGE: MessageSquare,
  SYSTEM: Settings,
};

const notificationColors = {
  INFO: "text-blue-500",
  SUCCESS: "text-green-500",
  WARNING: "text-yellow-500",
  ERROR: "text-red-500",
  APPOINTMENT: "text-purple-500",
  MESSAGE: "text-indigo-500",
  SYSTEM: "text-gray-500",
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const { markAsRead, deleteNotification } = useNotifications();
  const [isDeleting, setIsDeleting] = useState(false);

  const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Info;
  const iconColor = notificationColors[notification.type as keyof typeof notificationColors];

  const handleClick = async () => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      // Navigate if actionUrl exists
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);

    try {
      await deleteNotification(notification.id);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
      console.error("Error deleting notification:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative flex cursor-pointer gap-3 rounded-lg p-3 transition-colors",
        !notification.isRead && "bg-accent/50",
        notification.actionUrl && "hover:bg-accent"
      )}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="bg-primary absolute top-1/2 left-1 h-2 w-2 -translate-y-1/2 rounded-full" />
      )}

      {/* Icon */}
      <div className="flex-shrink-0 pt-0.5">
        <Icon className={cn("size-5", iconColor)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm leading-tight font-medium">{notification.title}</p>
        <p className="text-muted-foreground line-clamp-2 text-xs">{notification.message}</p>
        <p className="text-muted-foreground text-xs">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: localeId,
          })}
        </p>
      </div>

      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
