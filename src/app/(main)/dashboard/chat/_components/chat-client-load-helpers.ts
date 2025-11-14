/**
 * Helper functions for loadConversation
 */

import type { ConversationWithParticipants, MessageWithSender } from "@/app/actions/chat";
import {
  getCachedConversation,
  getCachedMessages,
  saveConversationCache,
  saveMessagesCache,
} from "@/app/actions/chat/_cache";
import { markMessagesAsRead } from "@/app/actions/chat/_messages";

import type { MessageCache } from "../_components/chat-client-types";

interface LoadCacheResult {
  cachedMessages: MessageCache | null;
  cachedConversation: ConversationWithParticipants | null;
}

/**
 * Load messages from cache
 */
function loadMessagesFromCache(
  conversationId: string,
  userId: string | null,
  messagesCacheRef: React.MutableRefObject<Map<string, MessageCache>>
): MessageCache | null {
  let cachedMessages = messagesCacheRef.current.get(conversationId) ?? null;

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

  return cachedMessages;
}

/**
 * Load conversation from cache
 */
function loadConversationFromCache(
  conversationId: string,
  userId: string | null,
  conversationsCacheRef: React.MutableRefObject<Map<string, ConversationWithParticipants>>
): ConversationWithParticipants | null {
  let cachedConversation = conversationsCacheRef.current.get(conversationId) ?? null;

  if (!cachedConversation && userId) {
    const localConversation = getCachedConversation(userId, conversationId);
    if (localConversation) {
      cachedConversation = localConversation;
      conversationsCacheRef.current.set(conversationId, cachedConversation);
    }
  }

  return cachedConversation;
}

/**
 * Load all cached data
 */
export function loadCachedData(
  conversationId: string,
  userId: string | null,
  messagesCacheRef: React.MutableRefObject<Map<string, MessageCache>>,
  conversationsCacheRef: React.MutableRefObject<Map<string, ConversationWithParticipants>>
): LoadCacheResult {
  const cachedMessages = loadMessagesFromCache(conversationId, userId, messagesCacheRef);
  const cachedConversation = loadConversationFromCache(
    conversationId,
    userId,
    conversationsCacheRef
  );

  return { cachedMessages, cachedConversation };
}

/**
 * Handle cached data found
 */
export function handleCachedDataFound(
  cachedMessages: MessageCache,
  cachedConversation: ConversationWithParticipants,
  conversationId: string,
  setSelectedConversation: React.Dispatch<
    React.SetStateAction<ConversationWithParticipants | null>
  >,
  setMessages: React.Dispatch<React.SetStateAction<MessageWithSender[]>>,
  setIsLoadingMessages: React.Dispatch<React.SetStateAction<boolean>>
) {
  setSelectedConversation(cachedConversation);
  setMessages(cachedMessages.messages);
  setIsLoadingMessages(false);
  markMessagesAsRead(conversationId).catch(console.error);
}

/**
 * Handle no cached data
 */
export function handleNoCachedData(
  setIsLoadingMessages: React.Dispatch<React.SetStateAction<boolean>>,
  setMessages: React.Dispatch<React.SetStateAction<MessageWithSender[]>>
) {
  setIsLoadingMessages(true);
  setMessages([]);
}

/**
 * Save loaded data to cache
 */
export function saveLoadedDataToCache(
  conversationId: string,
  loadedConversation: ConversationWithParticipants,
  conversationMessages: MessageWithSender[] | null,
  userId: string | null,
  messagesCacheRef: React.MutableRefObject<Map<string, MessageCache>>
) {
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
 * Handle loaded conversation data
 */
export function handleLoadedConversationData(
  loadedConversation: ConversationWithParticipants,
  conversationMessages: MessageWithSender[] | null,
  conversationId: string,
  userId: string | null,
  messagesCacheRef: React.MutableRefObject<Map<string, MessageCache>>,
  conversationsCacheRef: React.MutableRefObject<Map<string, ConversationWithParticipants>>,
  setSelectedConversation: React.Dispatch<
    React.SetStateAction<ConversationWithParticipants | null>
  >,
  setMessages: React.Dispatch<React.SetStateAction<MessageWithSender[]>>,
  setIsLoadingMessages: React.Dispatch<React.SetStateAction<boolean>>
) {
  conversationsCacheRef.current.set(conversationId, loadedConversation);
  saveLoadedDataToCache(
    conversationId,
    loadedConversation,
    conversationMessages,
    userId,
    messagesCacheRef
  );
  setSelectedConversation(loadedConversation);
  setMessages(conversationMessages ?? []);
  setIsLoadingMessages(false);
  markMessagesAsRead(conversationId).catch(console.error);
}
