/**
 * Conversations cache functions for localStorage persistence
 */

import type { ConversationWithParticipants } from "../../chat";

import {
  type SerializedConversationCache,
  serializeConversation,
  deserializeConversation,
} from "./chat-cache-helpers";
import {
  type ConversationCache,
  CACHE_EXPIRATION_MS,
  getConversationsCacheKey,
} from "./chat-cache-types";

/**
 * Save conversation cache to localStorage
 */
export function saveConversationCache(
  userId: string,
  conversation: ConversationWithParticipants
): void {
  try {
    const key = getConversationsCacheKey(userId);
    const existing = loadConversationsCache(userId);

    // Update cache for this conversation (existing is already deserialized)
    existing[conversation.id] = {
      conversation: conversation,
      lastUpdated: Date.now(),
    };

    // Cleanup old cache entries
    const now = Date.now();
    Object.keys(existing).forEach(convId => {
      if (now - existing[convId].lastUpdated > CACHE_EXPIRATION_MS) {
        delete existing[convId];
      }
    });

    // Serialize before saving to localStorage
    const serialized: Record<string, SerializedConversationCache> = {};
    Object.entries(existing).forEach(([convId, cache]) => {
      serialized[convId] = {
        conversation: serializeConversation(cache.conversation),
        lastUpdated: cache.lastUpdated,
      };
    });

    localStorage.setItem(key, JSON.stringify(serialized));
  } catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, clearing old conversation cache");
      try {
        clearConversationsCache(userId);
        const key = getConversationsCacheKey(userId);
        const newCache: Record<string, SerializedConversationCache> = {
          [conversation.id]: {
            conversation: serializeConversation(conversation),
            lastUpdated: Date.now(),
          },
        };
        localStorage.setItem(key, JSON.stringify(newCache));
      } catch (retryError) {
        console.error("Failed to save conversation cache after cleanup:", retryError);
      }
    } else {
      console.error("Error saving conversation cache:", error);
    }
  }
}

/**
 * Load conversations cache from localStorage
 */
export function loadConversationsCache(userId: string): Record<string, ConversationCache> {
  try {
    const key = getConversationsCacheKey(userId);
    const cached = localStorage.getItem(key);
    if (!cached) return {};

    const parsed = JSON.parse(cached) as Record<string, SerializedConversationCache>;
    const now = Date.now();

    // Filter out expired cache entries
    const valid: Record<string, ConversationCache> = {};
    Object.entries(parsed).forEach(([convId, cache]) => {
      if (now - cache.lastUpdated <= CACHE_EXPIRATION_MS) {
        valid[convId] = {
          conversation: deserializeConversation(cache.conversation),
          lastUpdated: cache.lastUpdated,
        };
      }
    });

    // Save back if some entries were removed
    if (Object.keys(valid).length !== Object.keys(parsed).length) {
      const cleaned: Record<string, SerializedConversationCache> = {};
      Object.entries(valid).forEach(([convId, cache]) => {
        cleaned[convId] = {
          conversation: serializeConversation(cache.conversation),
          lastUpdated: cache.lastUpdated,
        };
      });
      localStorage.setItem(key, JSON.stringify(cleaned));
    }

    return valid;
  } catch (error) {
    console.error("Error loading conversations cache:", error);
    return {};
  }
}

/**
 * Get conversation from cache
 */
export function getCachedConversation(
  userId: string,
  conversationId: string
): ConversationWithParticipants | null {
  const cache = loadConversationsCache(userId);
  const cached = cache[conversationId];
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.lastUpdated > CACHE_EXPIRATION_MS) {
    // Cache expired, remove it
    delete cache[conversationId];
    try {
      const key = getConversationsCacheKey(userId);
      const cleaned: Record<string, SerializedConversationCache> = {};
      Object.entries(cache).forEach(([convId, cacheData]) => {
        cleaned[convId] = {
          conversation: serializeConversation(cacheData.conversation),
          lastUpdated: cacheData.lastUpdated,
        };
      });
      localStorage.setItem(key, JSON.stringify(cleaned));
    } catch (error) {
      console.error("Error cleaning expired cache:", error);
    }
    return null;
  }

  return cached.conversation;
}

/**
 * Clear all conversations cache for a user
 */
export function clearConversationsCache(userId: string): void {
  try {
    const key = getConversationsCacheKey(userId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error clearing conversations cache:", error);
  }
}
