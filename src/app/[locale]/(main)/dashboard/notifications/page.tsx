"use client";

import { useState } from "react";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Bell, Check, Trash2, RefreshCw, Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useNotifications } from "../_components/notifications/notification-context";

type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "APPOINTMENT"
  | "MESSAGE"
  | "SYSTEM";

const notificationTypeColors: Record<NotificationType, string> = {
  INFO: "bg-blue-500",
  SUCCESS: "bg-green-500",
  WARNING: "bg-yellow-500",
  ERROR: "bg-red-500",
  APPOINTMENT: "bg-purple-500",
  MESSAGE: "bg-cyan-500",
  SYSTEM: "bg-gray-500",
};

export default function NotificationsPage() {
  const t = useTranslations("Notifications");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const totalCount = notifications.length;
  const readCount = Math.max(0, totalCount - unreadCount);

  const notificationTypeLabels: Record<NotificationType, string> = {
    INFO: t("filterInfo"),
    SUCCESS: t("filterSuccess"),
    WARNING: t("filterWarning"),
    ERROR: t("filterError"),
    APPOINTMENT: t("filterAppointment"),
    MESSAGE: t("filterMessage"),
    SYSTEM: t("filterSystem"),
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread" && n.isRead) return false;
    if (filter === "read" && !n.isRead) return false;
    if (typeFilter !== "all" && n.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="container mx-auto space-y-4 p-4 md:space-y-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{t("title")}</h1>
          <p className="text-muted-foreground text-sm md:text-base">{t("description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""} md:mr-2`} />
            <span className="hidden md:inline">{t("refresh")}</span>
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                markAllAsRead();
                toast.success(t("allMarkedAsRead"));
              }}
            >
              <Check className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{t("markAllAsRead")}</span>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg md:text-xl">{t("listTitle")}</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                {unreadCount > 0 ? t("unreadCount", { count: unreadCount }) : t("allRead")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={typeFilter}
                onValueChange={value => setTypeFilter(value as NotificationType | "all")}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t("filterAllTypes")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filterAllTypes")}</SelectItem>
                  <SelectItem value="INFO">{t("filterInfo")}</SelectItem>
                  <SelectItem value="SUCCESS">{t("filterSuccess")}</SelectItem>
                  <SelectItem value="WARNING">{t("filterWarning")}</SelectItem>
                  <SelectItem value="ERROR">{t("filterError")}</SelectItem>
                  <SelectItem value="APPOINTMENT">{t("filterAppointment")}</SelectItem>
                  <SelectItem value="MESSAGE">{t("filterMessage")}</SelectItem>
                  <SelectItem value="SYSTEM">{t("filterSystem")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={filter}
            onValueChange={value => setFilter(value as "all" | "unread" | "read")}
          >
            <TabsList className="grid w-full grid-cols-3 gap-1 p-1">
              <TabsTrigger value="all" className="text-xs md:text-sm">
                <span className="truncate">{t("tabAll")}</span>
                {totalCount > 0 && <span className="ml-1 hidden md:inline">({totalCount})</span>}
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs md:text-sm">
                <span className="truncate">{t("tabUnread")}</span>
                {unreadCount > 0 && <span className="ml-1 hidden md:inline">({unreadCount})</span>}
              </TabsTrigger>
              <TabsTrigger value="read" className="text-xs md:text-sm">
                <span className="truncate">{t("tabRead")}</span>
                {readCount > 0 && <span className="ml-1 hidden md:inline">({readCount})</span>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="text-muted-foreground mb-4 h-12 w-12" />
                  <h3 className="text-lg font-semibold">{t("noNotifications")}</h3>
                  <p className="text-muted-foreground">
                    {filter === "unread"
                      ? t("allReadMessage")
                      : typeFilter !== "all"
                        ? t("noTypeNotifications", { type: notificationTypeLabels[typeFilter] })
                        : t("noNotificationsAtAll")}
                  </p>
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <Card
                    key={notification.id}
                    className={`${
                      !notification.isRead ? "border-l-primary bg-muted/50 border-l-4" : ""
                    }`}
                  >
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start justify-between gap-2 md:gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge
                              className={`${notificationTypeColors[notification.type as NotificationType]} shrink-0 text-white`}
                            >
                              {notificationTypeLabels[notification.type as NotificationType]}
                            </Badge>
                            {!notification.isRead && (
                              <Badge variant="outline" className="shrink-0">
                                {t("new")}
                              </Badge>
                            )}
                            <span className="text-muted-foreground text-xs">
                              {format(new Date(notification.createdAt), "dd MMM yyyy, HH:mm", {
                                locale: id,
                              })}
                            </span>
                          </div>
                          <h4 className="mb-1 text-sm font-semibold md:text-base">
                            {notification.title}
                          </h4>
                          <p className="text-muted-foreground text-xs md:text-sm">
                            {notification.message}
                          </p>
                          {notification.actionUrl && (
                            <Button
                              variant="link"
                              size="sm"
                              className="mt-2 px-0 text-xs md:text-sm"
                              onClick={() => {
                                if (!notification.isRead) {
                                  markAsRead(notification.id);
                                }
                                window.location.href = notification.actionUrl!;
                              }}
                            >
                              {t("viewDetails")}
                            </Button>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              title={t("markAsRead")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            title={t("deleteNotification")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
