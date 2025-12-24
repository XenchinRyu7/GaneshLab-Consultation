"use client";

import { useState } from "react";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Bell, Check, Trash2, RefreshCw, Filter } from "lucide-react";
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

const notificationTypeLabels: Record<NotificationType, string> = {
  INFO: "Info",
  SUCCESS: "Sukses",
  WARNING: "Peringatan",
  ERROR: "Error",
  APPOINTMENT: "Janji Temu",
  MESSAGE: "Pesan",
  SYSTEM: "Sistem",
};

export default function NotificationsPage() {
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
          <h1 className="text-2xl font-bold md:text-3xl">Notifikasi</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Kelola dan lihat semua notifikasi Anda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""} md:mr-2`} />
            <span className="hidden md:inline">Refresh</span>
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                markAllAsRead();
                toast.success("Semua notifikasi ditandai telah dibaca");
              }}
            >
              <Check className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Tandai Semua Dibaca</span>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg md:text-xl">Daftar Notifikasi</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                {unreadCount > 0
                  ? `Anda memiliki ${unreadCount} notifikasi yang belum dibaca`
                  : "Semua notifikasi sudah dibaca"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={typeFilter}
                onValueChange={value => setTypeFilter(value as NotificationType | "all")}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="SUCCESS">Sukses</SelectItem>
                  <SelectItem value="WARNING">Peringatan</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                  <SelectItem value="APPOINTMENT">Janji Temu</SelectItem>
                  <SelectItem value="MESSAGE">Pesan</SelectItem>
                  <SelectItem value="SYSTEM">Sistem</SelectItem>
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
                <span className="truncate">Semua</span>
                {totalCount > 0 && <span className="ml-1 hidden md:inline">({totalCount})</span>}
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs md:text-sm">
                <span className="truncate">Belum Dibaca</span>
                {unreadCount > 0 && <span className="ml-1 hidden md:inline">({unreadCount})</span>}
              </TabsTrigger>
              <TabsTrigger value="read" className="text-xs md:text-sm">
                <span className="truncate">Sudah Dibaca</span>
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
                  <h3 className="text-lg font-semibold">Tidak ada notifikasi</h3>
                  <p className="text-muted-foreground">
                    {filter === "unread"
                      ? "Semua notifikasi sudah dibaca"
                      : typeFilter !== "all"
                        ? `Tidak ada notifikasi tipe ${notificationTypeLabels[typeFilter]}`
                        : "Anda tidak memiliki notifikasi"}
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
                                Baru
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
                              Lihat Detail →
                            </Button>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              title="Tandai sudah dibaca"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            title="Hapus notifikasi"
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
