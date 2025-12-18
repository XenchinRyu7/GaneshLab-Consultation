import { useEffect, useRef } from "react";

import {
  ConversationWithParticipants,
  MessageWithSender,
  markMessagesAsRead,
  type Contact,
} from "@/app/actions/chat";
import { supabase } from "@/lib/supabase";

import type { SupabasePayload } from "../_components/chat-client-types";

/**
 * Transform Supabase payload to MessageWithSender using conversation participants
 */
function transformPayloadToMessage(
  payload: SupabasePayload,
  conversation: ConversationWithParticipants
): MessageWithSender | null {
  if (!payload.new) {
    console.warn("⚠️ transformPayloadToMessage: payload.new is missing");
    return null;
  }

  const newData = payload.new;
  const senderId = newData.sender_id;
  if (!senderId) {
    console.warn("⚠️ transformPayloadToMessage: sender_id is missing", newData);
    return null;
  }

  // Get sender info from conversation participants
  const isClient = senderId === conversation.clientId;
  const senderName = isClient ? conversation.clientName : conversation.picName;
  const senderAvatar = isClient ? conversation.clientAvatar : conversation.picAvatar;

  // Parse created_at timestamp - ensure proper timezone handling
  const createdAtValue = newData.created_at as string | Date | undefined;
  let createdAtDate: Date;
  if (typeof createdAtValue === "string") {
    // Supabase returns timestamp WITHOUT 'Z' suffix, e.g. '2025-12-18T20:17:24.27'
    // JavaScript interprets this as LOCAL time, causing 7hr offset bug
    // Fix: Ensure 'Z' suffix for proper UTC parsing
    let timestampString = createdAtValue;
    if (
      !timestampString.endsWith("Z") &&
      !timestampString.includes("+") &&
      !timestampString.includes("-", 10)
    ) {
      timestampString = timestampString + "Z";
    }
    createdAtDate = new Date(timestampString);

    console.log("🔍 [REALTIME] Parsed timestamp:", {
      original: createdAtValue,
      fixed: timestampString,
      result: createdAtDate.toISOString(),
    });
  } else if (createdAtValue instanceof Date) {
    createdAtDate = createdAtValue;
  } else {
    createdAtDate = new Date();
  }

  return {
    id: newData.id as string,
    conversationId: newData.conversation_id as string,
    senderId,
    senderName,
    senderAvatar,
    content: (newData.content as string) || "",
    isDeleted: (newData.is_deleted as boolean) || false,
    editedAt: newData.edited_at ? new Date(newData.edited_at) : null,
    readAt: newData.read_at ? new Date(newData.read_at) : null,
    createdAt: createdAtDate,
  };
}

interface UseMessageSubscriptionProps {
  selectedConversation: ConversationWithParticipants | null;
  userId: string | undefined;
  setMessages: React.Dispatch<React.SetStateAction<MessageWithSender[]>>;
  refreshContacts: () => Promise<void>;
  setContacts?: React.Dispatch<React.SetStateAction<Contact[]>>;
}

export function useMessageSubscription({
  selectedConversation,
  userId,
  setMessages,
  refreshContacts,
  setContacts,
}: UseMessageSubscriptionProps) {
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const prevConversationIdRef = useRef<string | undefined>(undefined);
  const currentMessagesRef = useRef<MessageWithSender[]>([]);
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Update current messages ref when messages change
  useEffect(() => {
    currentMessagesRef.current = [];
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (!selectedConversation || !userId) {
      return;
    }

    // Only clear processed messages when conversation changes
    if (prevConversationIdRef.current !== selectedConversation.id) {
      processedMessageIdsRef.current.clear();
      prevConversationIdRef.current = selectedConversation.id;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      const channelName = `conversation:${selectedConversation.id}`;

      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${selectedConversation.id}`,
          },
          async (payload: SupabasePayload) => {
            if (!payload.new) {
              return;
            }

            const messageConversationId = payload.new.conversation_id as string;
            const messageId = payload.new.id as string;

            if (processedMessageIdsRef.current.has(messageId)) return;
            processedMessageIdsRef.current.add(messageId);
            if (processedMessageIdsRef.current.size > 100) {
              processedMessageIdsRef.current.clear();
            }

            if (messageConversationId !== selectedConversation.id) {
              return;
            }

            const newMessage = transformPayloadToMessage(payload, selectedConversation);
            if (!newMessage) {
              console.warn("⚠️ [TRACE] Failed to transform message");
              return;
            }

            const newSenderId = newMessage.senderId;

            setMessages(prev => {
              const existingIndex = prev.findIndex(
                msg =>
                  msg.id === newMessage.id ||
                  (msg.tempId &&
                    msg.content === newMessage.content &&
                    msg.senderId === newMessage.senderId)
              );

              let updatedMessages: MessageWithSender[];

              // Always ensure proper createdAt format
              const newMessageCreatedAt =
                newMessage.createdAt instanceof Date
                  ? newMessage.createdAt
                  : new Date(newMessage.createdAt);

              if (existingIndex >= 0) {
                // Update existing message
                updatedMessages = [...prev];
                updatedMessages[existingIndex] = {
                  ...newMessage,
                  status: "sent" as const,
                  createdAt: newMessageCreatedAt,
                };
              } else {
                // Add new message
                updatedMessages = [...prev, { ...newMessage, createdAt: newMessageCreatedAt }];
              }

              // ALWAYS sort messages by time after any update to ensure correct order
              // Create a completely new array to force React reconciliation
              updatedMessages = [...updatedMessages].sort((a, b) => {
                const aTime =
                  a.createdAt instanceof Date
                    ? a.createdAt.getTime()
                    : new Date(a.createdAt).getTime();
                const bTime =
                  b.createdAt instanceof Date
                    ? b.createdAt.getTime()
                    : new Date(b.createdAt).getTime();
                return aTime - bTime;
              });

              currentMessagesRef.current = updatedMessages;

              return updatedMessages;
            });

            if (newSenderId !== userId) {
              await markMessagesAsRead(selectedConversation.id);
            }

            if (setContacts) {
              setContacts(prevContacts => {
                return prevContacts.map(contact => {
                  // Update contact yang conversation-nya menerima pesan baru
                  if (contact.conversationId === selectedConversation.id) {
                    return {
                      ...contact,
                      lastMessage: newMessage.content,
                      lastMessageAt: newMessage.createdAt,
                      unreadCount:
                        newSenderId !== userId
                          ? (contact.unreadCount || 0) + 1
                          : contact.unreadCount,
                    };
                  }
                  // Return unchanged contact as new reference
                  return { ...contact };
                });
              });
            }

            setTimeout(() => {
              refreshContacts().catch(err => {
                console.error("Error refreshing contacts:", err);
              });
            }, 500);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${selectedConversation.id}`,
          },
          async (payload: SupabasePayload) => {
            const updatedMessage = transformPayloadToMessage(payload, selectedConversation);
            if (!updatedMessage) return;

            const updatedMessageId = updatedMessage.id;

            // Update message directly from payload
            setMessages(prev => {
              const messageExists = prev.some(msg => msg.id === updatedMessageId);
              if (!messageExists) return prev; // Message not in current view, skip

              const updatedMessages = prev.map(msg =>
                msg.id === updatedMessageId
                  ? { ...updatedMessage, status: msg.status, tempId: msg.tempId }
                  : msg
              );

              // Update current messages ref
              currentMessagesRef.current = updatedMessages;

              return updatedMessages;
            });

            // Refresh contacts list immediately to update last message
            requestAnimationFrame(() => {
              refreshContacts().catch(err => {
                console.error("Error refreshing contacts:", err);
              });
            });
          }
        )
        .subscribe((status: string, err?: Error) => {
          if (status === "CHANNEL_ERROR") {
            console.error("Realtime subscription error:", err);
          } else if (status === "TIMED_OUT") {
            console.error("Realtime subscription timed out");
          }
        });
    } catch (error) {
      console.error("Error setting up real-time subscription:", error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id]);
}
