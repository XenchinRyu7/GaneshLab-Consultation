import { supabaseServer } from "./supabase-server";

export type NotificationPayload = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt?: string | Date;
};

const channelName = (userId: string) => `notifications-user-${userId}`;

export async function publishNotificationNew(userId: string, payload: NotificationPayload) {
  try {
    const ch = supabaseServer.channel(channelName(userId));
    await ch.send({ type: "broadcast", event: "notification:new", payload });
    // No need to subscribe server-side; transient channel is fine
    await supabaseServer.removeChannel(ch);
  } catch (e) {
    console.error("[Realtime] Failed to broadcast notification:new", e);
  }
}

export async function publishNotificationUpdate(
  userId: string,
  payload: Partial<NotificationPayload> & { id: string }
) {
  try {
    const ch = supabaseServer.channel(channelName(userId));
    await ch.send({ type: "broadcast", event: "notification:update", payload });
    await supabaseServer.removeChannel(ch);
  } catch (e) {
    console.error("[Realtime] Failed to broadcast notification:update", e);
  }
}

export async function publishNotificationDelete(userId: string, id: string, wasUnread?: boolean) {
  try {
    const ch = supabaseServer.channel(channelName(userId));
    await ch.send({ type: "broadcast", event: "notification:delete", payload: { id, wasUnread } });
    await supabaseServer.removeChannel(ch);
  } catch (e) {
    console.error("[Realtime] Failed to broadcast notification:delete", e);
  }
}
