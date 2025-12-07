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
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifikasi</h1>
          <p className="text-muted-foreground">Kelola dan lihat semua notifikasi Anda</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
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
              <Check className="mr-2 h-4 w-4" />
              Tandai Semua Dibaca
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Notifikasi</CardTitle>
              <CardDescription>
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
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter Tipe" />
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Semua {totalCount > 0 && `(${totalCount})`}</TabsTrigger>
              <TabsTrigger value="unread">
                Belum Dibaca {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="read">
                Sudah Dibaca {readCount > 0 && `(${readCount})`}
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
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Badge
                              className={`${notificationTypeColors[notification.type as NotificationType]} text-white`}
                            >
                              {notificationTypeLabels[notification.type as NotificationType]}
                            </Badge>
                            {!notification.isRead && <Badge variant="outline">Baru</Badge>}
                            <span className="text-muted-foreground text-xs">
                              {format(new Date(notification.createdAt), "dd MMM yyyy, HH:mm", {
                                locale: id,
                              })}
                            </span>
                          </div>
                          <h4 className="mb-1 font-semibold">{notification.title}</h4>
                          <p className="text-muted-foreground text-sm">{notification.message}</p>
                          {notification.actionUrl && (
                            <Button
                              variant="link"
                              size="sm"
                              className="mt-2 px-0"
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
