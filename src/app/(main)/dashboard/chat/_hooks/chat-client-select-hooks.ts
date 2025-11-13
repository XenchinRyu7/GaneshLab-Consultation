/**
 * Hooks for contact selection logic in ChatClient
 */

import { useCallback } from "react";

import {
  getConversationById,
  getMessages,
  markMessagesAsRead,
  type Contact,
  type ConversationWithParticipants,
  type MessageWithSender,
} from "@/app/actions/chat";
import {
  getCachedMessages,
  getCachedConversation,
  saveMessagesCache,
  saveConversationCache,
} from "@/app/actions/chat/_cache";
import type { User } from "@/lib/auth";

import type { MessageCache } from "../_components/chat-client-types";

/**
 * Load cached messages and conversation from memory or localStorage
 */
function loadCachedData(
  conversationId: string,
  userId: string | undefined,
  messagesCacheRef: React.MutableRefObject<Map<string, MessageCache>>,
  conversationsCacheRef: React.MutableRefObject<Map<string, ConversationWithParticipants>>
): { messages: MessageCache | null; conversation: ConversationWithParticipants | null } {
  let cachedMessages = messagesCacheRef.current.get(conversationId);
  let cachedConversation = conversationsCacheRef.current.get(conversationId);

  if (!cachedMessages && userId) {
    const localMessages = getCachedMessages(userId, conversationId);
    if (localMessages) {
      cachedMessages = {
        messages: localMessages,
        lastUpdated: Date.now(),
      };
      messagesCacheRef.current.set(conversationId, cachedMessages);
    }
  }

  if (!cachedConversation && userId) {
    const localConversation = getCachedConversation(userId, conversationId);
    if (localConversation) {
      cachedConversation = localConversation;
      conversationsCacheRef.current.set(conversationId, cachedConversation);
    }
  }

  return {
    messages: cachedMessages ?? null,
    conversation: cachedConversation ?? null,
  };
}

/**
 * Save loaded data to cache
 */
function saveLoadedDataToCache(
  conversationId: string,
  loadedConversation: ConversationWithParticipants,
  conversationMessages: MessageWithSender[] | null,
  userId: string | undefined,
  messagesCacheRef: React.MutableRefObject<Map<string, MessageCache>>,
  conversationsCacheRef: React.MutableRefObject<Map<string, ConversationWithParticipants>>
) {
  conversationsCacheRef.current.set(conversationId, loadedConversation);

  if (conversationMessages) {
    const messageCache: MessageCache = {
      messages: conversationMessages,
      lastUpdated: Date.now(),
    };
    messagesCacheRef.current.set(conversationId, messageCache);

    if (userId) {
      saveMessagesCache(userId, conversationId, conversationMessages);
      saveConversationCache(userId, loadedConversation);
    }
  }
}

/**
 * Load conversation and messages from server
 */
async function loadConversationData(conversationId: string) {
  const [conversationResult, messagesResult] = await Promise.all([
    getConversationById(conversationId),
    getMessages(conversationId),
  ]);

  const { conversation: loadedConversation, error: convError } = conversationResult;
  const { messages: conversationMessages, error: msgError } = messagesResult;

  return { loadedConversation, convError, conversationMessages, msgError };
}

/**
 * Handle cached data when available
 */
function handleCachedData(
  cachedMessages: MessageCache | null,
  cachedConversation: ConversationWithParticipants | null,
  conversationId: string,
  setSelectedConversation: React.Dispatch<
    React.SetStateAction<ConversationWithParticipants | null>
  >,
  setMessages: React.Dispatch<React.SetStateAction<MessageWithSender[]>>,
  setIsLoadingMessages: React.Dispatch<React.SetStateAction<boolean>>
): boolean {
  if (cachedMessages && cachedConversation) {
    setSelectedConversation(cachedConversation);
    setMessages(cachedMessages.messages);
    setIsLoadingMessages(false);
    markMessagesAsRead(conversationId).catch(console.error);
    return true;
  }
  return false;
}

/**
 * Handle server-loaded data
 */
async function handleServerData(
  conversationId: string,
  user: User | null,
  messagesCacheRef: React.MutableRefObject<Map<string, MessageCache>>,
  conversationsCacheRef: React.MutableRefObject<Map<string, ConversationWithParticipants>>,
  setSelectedConversation: React.Dispatch<
    React.SetStateAction<ConversationWithParticipants | null>
  >,
  setMessages: React.Dispatch<React.SetStateAction<MessageWithSender[]>>,
  setIsLoadingMessages: React.Dispatch<React.SetStateAction<boolean>>,
  refreshContacts: () => Promise<void>
): Promise<void> {
  try {
    const { loadedConversation, convError, conversationMessages, msgError } =
      await loadConversationData(conversationId);

    if (convError || !loadedConversation) {
      console.error("Error loading conversation:", convError);
      setIsLoadingMessages(false);
      return;
    }

    if (msgError) {
      console.error("Error loading messages:", msgError);
    }

    saveLoadedDataToCache(
      conversationId,
      loadedConversation,
      conversationMessages,
      user?.id,
      messagesCacheRef,
      conversationsCacheRef
    );

    setSelectedConversation(loadedConversation);
    setMessages(conversationMessages || []);
    await markMessagesAsRead(conversationId);

    setIsLoadingMessages(false);
    setTimeout(() => {
      refreshContacts();
    }, 100);
  } catch (error) {
    console.error("Error loading conversation/messages:", error);
    setIsLoadingMessages(false);
  }
}

/**
 * Hook for handling contact selection
 */
export function useSelectContact(
  user: User | null,
  messagesCacheRef: React.MutableRefObject<Map<string, MessageCache>>,
  conversationsCacheRef: React.MutableRefObject<Map<string, ConversationWithParticipants>>,
  setSelectedConversation: React.Dispatch<
    React.SetStateAction<ConversationWithParticipants | null>
  >,
  setMessages: React.Dispatch<React.SetStateAction<MessageWithSender[]>>,
  setIsLoadingMessages: React.Dispatch<React.SetStateAction<boolean>>,
  refreshContacts: () => Promise<void>
) {
  return useCallback(
    async (contact: Contact) => {
      const contactConversationId = contact.conversationId;

      if (!contactConversationId) {
        setSelectedConversation(null);
        setMessages([]);
        return;
      }

      // Load from cache
      const { messages: cachedMessages, conversation: cachedConversation } = loadCachedData(
        contactConversationId,
        user?.id,
        messagesCacheRef,
        conversationsCacheRef
      );

      // Use cached data if available
      if (
        handleCachedData(
          cachedMessages,
          cachedConversation,
          contactConversationId,
          setSelectedConversation,
          setMessages,
          setIsLoadingMessages
        )
      ) {
        return;
      }

      // Load from server
      setIsLoadingMessages(true);
      setMessages([]);

      await handleServerData(
        contactConversationId,
        user,
        messagesCacheRef,
        conversationsCacheRef,
        setSelectedConversation,
        setMessages,
        setIsLoadingMessages,
        refreshContacts
      );
    },
    [
      user,
      messagesCacheRef,
      conversationsCacheRef,
      setSelectedConversation,
      setMessages,
      setIsLoadingMessages,
      refreshContacts,
    ]
  );
}
