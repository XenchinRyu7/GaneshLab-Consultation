import { useEffect, useRef } from "react";

import { Contact } from "@/app/actions/chat";
import { supabase } from "@/lib/supabase";

import type { SupabasePayload } from "../_components/chat-client-types";

export function useConversationSubscription(
  refreshContacts: () => Promise<void>,
  setContacts?: React.Dispatch<React.SetStateAction<Contact[]>>,
  userId?: string
) {
  const refreshContactsRef = useRef(refreshContacts);
  const userIdRef = useRef(userId);

  useEffect(() => {
    refreshContactsRef.current = refreshContacts;
  }, [refreshContacts]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel("all_messages_for_contacts")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          async (payload: SupabasePayload) => {
            if (payload.new && setContacts) {
              const conversationId = payload.new.conversation_id as string;
              const senderId = payload.new.sender_id as string;
              const content = payload.new.content as string;
              const createdAt = payload.new.created_at as string;

              setContacts(prevContacts => {
                return prevContacts.map(contact => {
                  if (contact.conversationId === conversationId) {
                    return {
                      ...contact,
                      lastMessage: content,
                      lastMessageAt: createdAt ? new Date(createdAt) : new Date(),
                      unreadCount:
                        senderId !== userIdRef.current
                          ? (contact.unreadCount || 0) + 1
                          : contact.unreadCount,
                    };
                  }
                  return { ...contact };
                });
              });
            }

            setTimeout(() => {
              refreshContactsRef.current().catch(err => {
                console.error("Error refreshing contacts:", err);
              });
            }, 300);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "conversations",
          },
          () => {
            refreshContactsRef.current();
          }
        )
        .subscribe(status => {
          if (status === "CHANNEL_ERROR") {
            console.error("Error subscribing to messages for contacts");
          }
        });
    } catch (error) {
      console.error("Error setting up conversations subscription:", error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [setContacts, userId]);
}
