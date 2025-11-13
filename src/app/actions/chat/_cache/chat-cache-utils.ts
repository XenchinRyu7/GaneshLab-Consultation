/**
 * Utility functions for chat cache management
 */

import { loadConversationsCache, clearConversationsCache } from "./chat-cache-conversations";
import {
  type SerializedMessageCache,
  type SerializedConversationCache,
  serializeMessages,
  serializeConversation,
} from "./chat-cache-helpers";
import { loadMessagesCache, clearMessagesCache } from "./chat-cache-messages";
import { getMessagesCacheKey, getConversationsCacheKey } from "./chat-cache-types";

/**
 * Clear all chat cache for a user
 */
export function clearAllChatCache(userId: string): void {
  clearMessagesCache(userId);
  clearConversationsCache(userId);
}

/**
 * Remove a specific conversation from cache
 */
export function removeConversationFromCache(userId: string, conversationId: string): void {
  try {
    // Remove from messages cache
    const messagesCache = loadMessagesCache(userId);
    if (conversationId in messagesCache) {
      delete messagesCache[conversationId];
      const key = getMessagesCacheKey(userId);
      const cleaned: Record<string, SerializedMessageCache> = {};
      Object.entries(messagesCache).forEach(([convId, cache]) => {
        cleaned[convId] = {
          messages: serializeMessages(cache.messages),
          lastUpdated: cache.lastUpdated,
        };
      });
      localStorage.setItem(key, JSON.stringify(cleaned));
    }

    // Remove from conversations cache
    const conversationsCache = loadConversationsCache(userId);
    if (conversationId in conversationsCache) {
      delete conversationsCache[conversationId];
      const key = getConversationsCacheKey(userId);
      const cleaned: Record<string, SerializedConversationCache> = {};
      Object.entries(conversationsCache).forEach(([convId, cache]) => {
        cleaned[convId] = {
          conversation: serializeConversation(cache.conversation),
          lastUpdated: cache.lastUpdated,
        };
      });
      localStorage.setItem(key, JSON.stringify(cleaned));
    }
  } catch (error) {
    console.error("Error removing conversation from cache:", error);
  }
}
