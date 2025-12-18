"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

import { useUserStore } from "@/stores/user/user-provider";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: Date | string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useUserStore(state => state.currentUser);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=100");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/notifications/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const notification = notifications.find(n => n.id === id);
          setNotifications(prev => prev.filter(n => n.id !== id));
          if (notification && !notification.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    },
    [notifications]
  );

  useEffect(() => {
    fetchNotifications();
    // Polling fallback: 60s (realtime broadcast handles most updates)
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Realtime updates via Supabase (optional; only if env is configured)
  useEffect(() => {
    let channel: any | null = null;
    let supabaseClient: any | null = null;

    // Require a logged-in user to scope the stream
    if (!currentUser?.id) return;

    (async () => {
      try {
        const mod = await import("@/lib/supabase");
        supabaseClient = mod.supabase;

        channel = supabaseClient
          .channel(`notifications-user-${currentUser.id}`)
          // Broadcast: new
          .on("broadcast", { event: "notification:new" }, (payload: any) => {
            const n = payload?.payload;
            if (!n?.id) return;
            setNotifications(prev => [
              {
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type,
                isRead: !!n.isRead,
                actionUrl: n.actionUrl ?? null,
                createdAt: n.createdAt ?? new Date().toISOString(),
              },
              ...prev,
            ]);
            if (!n.isRead) setUnreadCount(prev => prev + 1);
          })
          // Broadcast: update
          .on("broadcast", { event: "notification:update" }, (payload: any) => {
            const n = payload?.payload;
            if (!n?.id) return;
            const wasUnread = notifications.find(x => x.id === n.id && !x.isRead) != null;
            const isNowRead = !!n.isRead;
            setNotifications(prev =>
              prev.map(item => (item.id === n.id ? { ...item, ...n } : item))
            );
            if (wasUnread && isNowRead) setUnreadCount(prev => Math.max(0, prev - 1));
          })
          // Broadcast: delete
          .on("broadcast", { event: "notification:delete" }, (payload: any) => {
            const { id, wasUnread } = payload?.payload ?? {};
            if (!id) return;
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
          })
          .subscribe((status: string) => {
            if (status === "SUBSCRIBED") {
              console.debug("Subscribed to notification broadcasts");
            } else if (status === "CHANNEL_ERROR") {
              console.debug("Notification realtime unavailable; using polling fallback");
            }
          });
      } catch (e) {
        // Supabase not configured; silently skip realtime
        // console.warn("Supabase Realtime not active:", e);
      }
    })();

    return () => {
      try {
        if (supabaseClient && channel) {
          supabaseClient.removeChannel(channel);
        } else if (channel?.unsubscribe) {
          channel.unsubscribe();
        }
      } catch {
        // noop
      }
    };
  }, [currentUser?.id]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
