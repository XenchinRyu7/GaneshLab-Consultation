import { useEffect } from "react";

import {
  ConversationWithParticipants,
  MessageWithSender,
  getMessages,
  markMessagesAsRead,
  getConversationById,
} from "@/app/actions/chat";
import {
  saveMessagesCache,
  loadMessagesCache,
  loadConversationsCache,
} from "@/app/actions/chat/_cache";
import { supabase } from "@/lib/supabase";

import {
  handleCachedDataFound,
  handleLoadedConversationData,
  handleNoCachedData,
  loadCachedData,
} from "../_components/chat-client-load-helpers";
import type { MessageCache, SupabasePayload } from "../_components/chat-client-types";

interface UseMessageSubscriptionProps {
  selectedConversation: ConversationWithParticipants | null;
  userId: string | undefined;
  setMessages: React.Dispatch<React.SetStateAction<MessageWithSender[]>>;
  messagesCacheRef: React.MutableRefObject<Map<string, MessageCache>>;
  refreshContacts: () => Promise<void>;
}

export function useMessageSubscription({
  selectedConversation,
  userId,
  setMessages,
  messagesCacheRef,
  refreshContacts,
}: UseMessageSubscriptionProps) {
  useEffect(() => {
    if (!selectedConversation || !userId) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel(`conversation:${selectedConversation.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${selectedConversation.id}`,
          },
          async (payload: SupabasePayload) => {
            const newSenderId = payload.new?.sender_id;

            // Fetch all messages from server
            const { messages: allMessages } = await getMessages(selectedConversation.id);

            // Update messages state, replacing optimistic with server messages
            setMessages(prev => {
              const serverMessageMap = new Map(allMessages.map(m => [m.id, m]));

              const updated = prev.map(prevMsg => {
                if (serverMessageMap.has(prevMsg.id)) {
                  return serverMessageMap.get(prevMsg.id)!;
                }

                if (prevMsg.tempId) {
                  const matching = allMessages.find(
                    m =>
                      m.content === prevMsg.content &&
                      m.senderId === prevMsg.senderId &&
                      Math.abs(
                        new Date(m.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()
                      ) < 5000
                  );

                  if (matching) {
                    return { ...matching, status: "sent" as const };
                  }

                  return prevMsg;
                }

                return prevMsg;
              });

              const currentIds = new Set(updated.map(m => m.id));
              const newMessages = allMessages.filter(m => !currentIds.has(m.id));

              const combined = [...updated, ...newMessages].sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );

              const messageCache: MessageCache = {
                messages: combined,
                lastUpdated: Date.now(),
              };
              messagesCacheRef.current.set(selectedConversation.id, messageCache);

              if (userId) {
                saveMessagesCache(userId, selectedConversation.id, combined);
              }

              return combined;
            });

            if (newSenderId !== userId) {
              await markMessagesAsRead(selectedConversation.id);
            }

            setTimeout(() => {
              refreshContacts();
            }, 100);
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
            const updatedMessageId = payload.new?.id;

            const { messages: allMessages } = await getMessages(selectedConversation.id);
            const updatedMessage = allMessages.find(m => m.id === updatedMessageId);

            if (updatedMessage) {
              setMessages(prev => {
                const updatedMessages = prev.map(msg =>
                  msg.id === updatedMessageId
                    ? { ...updatedMessage, status: msg.status, tempId: msg.tempId }
                    : msg
                );

                const messageCache: MessageCache = {
                  messages: updatedMessages,
                  lastUpdated: Date.now(),
                };
                messagesCacheRef.current.set(selectedConversation.id, messageCache);

                if (userId) {
                  saveMessagesCache(userId, selectedConversation.id, updatedMessages);
                }

                return updatedMessages;
              });
            }

            setTimeout(() => {
              refreshContacts();
            }, 100);
          }
        )
        .subscribe(status => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to conversation:", selectedConversation.id);
          } else if (status === "CHANNEL_ERROR") {
            // Realtime not enabled for this table; will use polling instead
            console.debug("Realtime not available for messages; using polling fallback");
          }
        });
    } catch (error) {
      // Supabase might not be configured; silently fallback to polling
      console.debug("Real-time subscription failed, using polling:", error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [selectedConversation, userId, setMessages, messagesCacheRef, refreshContacts]);
}

export function useConversationSubscription(refreshContacts: () => Promise<void>) {
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel("conversations")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "conversations",
          },
          () => {
            refreshContacts();
          }
        )
        .subscribe(status => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to conversations");
          } else if (status === "CHANNEL_ERROR") {
            // Realtime not enabled for this table; will use polling instead
            console.debug("Realtime not available for conversations; using polling fallback");
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
  }, [refreshContacts]);
}

interface UseCacheProps {
  userId: string | undefined;
  messagesCacheRef: React.MutableRefObject<Map<string, MessageCache>>;
  conversationsCacheRef: React.MutableRefObject<Map<string, ConversationWithParticipants>>;
}

export function useCache({ userId, messagesCacheRef, conversationsCacheRef }: UseCacheProps) {
  useEffect(() => {
    if (!userId) return;

    try {
      const cachedMessages = loadMessagesCache(userId);
      Object.entries(cachedMessages).forEach(([conversationId, cache]) => {
        messagesCacheRef.current.set(conversationId, cache);
      });

      const cachedConversations = loadConversationsCache(userId);
      Object.entries(cachedConversations).forEach(([conversationId, cache]) => {
        conversationsCacheRef.current.set(conversationId, cache.conversation);
      });
    } catch (error) {
      console.error("Error loading cache from localStorage:", error);
    }
  }, [userId, messagesCacheRef, conversationsCacheRef]);
}

interface UseLoadConversationProps {
  conversationId: string;
  userId: string | undefined;
  messagesCacheRef: React.MutableRefObject<Map<string, MessageCache>>;
  conversationsCacheRef: React.MutableRefObject<Map<string, ConversationWithParticipants>>;
  setSelectedConversation: React.Dispatch<
    React.SetStateAction<ConversationWithParticipants | null>
  >;
  setMessages: React.Dispatch<React.SetStateAction<MessageWithSender[]>>;
  setIsLoadingMessages: React.Dispatch<React.SetStateAction<boolean>>;
}

export async function loadConversation({
  conversationId,
  userId,
  messagesCacheRef,
  conversationsCacheRef,
  setSelectedConversation,
  setMessages,
  setIsLoadingMessages,
}: UseLoadConversationProps) {
  // Check cache first
  const { cachedMessages, cachedConversation } = loadCachedData(
    conversationId,
    userId ?? null,
    messagesCacheRef,
    conversationsCacheRef
  );

  if (cachedMessages && cachedConversation) {
    handleCachedDataFound(
      cachedMessages,
      cachedConversation,
      conversationId,
      setSelectedConversation,
      setMessages,
      setIsLoadingMessages
    );
  } else {
    handleNoCachedData(setIsLoadingMessages, setMessages);
  }

  // Load fresh data
  try {
    const [conversationResult, messagesResult] = await Promise.all([
      getConversationById(conversationId),
      getMessages(conversationId),
    ]);

    const { conversation: loadedConversation, error: convError } = conversationResult;
    const { messages: conversationMessages, error: msgError } = messagesResult;

    if (convError || !loadedConversation) {
      console.error("Error loading conversation:", convError);
      setIsLoadingMessages(false);
      return;
    }

    if (msgError) {
      console.error("Error loading messages:", msgError);
    }

    handleLoadedConversationData(
      loadedConversation,
      conversationMessages,
      conversationId,
      userId ?? null,
      messagesCacheRef,
      conversationsCacheRef,
      setSelectedConversation,
      setMessages,
      setIsLoadingMessages
    );
  } catch (error) {
    console.error("Error loading conversation/messages:", error);
    setIsLoadingMessages(false);
  }
}
