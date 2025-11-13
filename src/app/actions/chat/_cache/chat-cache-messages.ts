/**
 * Messages cache functions for localStorage persistence
 */

import type { MessageWithSender } from "../../chat";

import {
  type SerializedMessageCache,
  deserializeMessages,
  serializeMessages,
} from "./chat-cache-helpers";
import { type MessageCache, CACHE_EXPIRATION_MS, getMessagesCacheKey } from "./chat-cache-types";

/**
 * Save messages cache to localStorage
 */
export function saveMessagesCache(
  userId: string,
  conversationId: string,
  messages: MessageWithSender[]
): void {
  try {
    const key = getMessagesCacheKey(userId);
    const existing = loadMessagesCache(userId);

    // Update cache for this conversation (existing is already deserialized)
    existing[conversationId] = {
      messages: messages,
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
    const serialized: Record<string, SerializedMessageCache> = {};
    Object.entries(existing).forEach(([convId, cache]) => {
      serialized[convId] = {
        messages: serializeMessages(cache.messages),
        lastUpdated: cache.lastUpdated,
      };
    });

    localStorage.setItem(key, JSON.stringify(serialized));
  } catch (error) {
    // Handle localStorage quota exceeded or other errors
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, clearing old cache");
      // Clear old cache and try again
      try {
        clearMessagesCache(userId);
        const key = getMessagesCacheKey(userId);
        const newCache: Record<string, SerializedMessageCache> = {
          [conversationId]: {
            messages: serializeMessages(messages),
            lastUpdated: Date.now(),
          },
        };
        localStorage.setItem(key, JSON.stringify(newCache));
      } catch (retryError) {
        console.error("Failed to save messages cache after cleanup:", retryError);
      }
    } else {
      console.error("Error saving messages cache:", error);
    }
  }
}

/**
 * Load messages cache from localStorage
 */
export function loadMessagesCache(userId: string): Record<string, MessageCache> {
  try {
    const key = getMessagesCacheKey(userId);
    const cached = localStorage.getItem(key);
    if (!cached) return {};

    const parsed = JSON.parse(cached) as Record<string, SerializedMessageCache>;
    const now = Date.now();

    // Filter out expired cache entries
    const valid: Record<string, MessageCache> = {};
    Object.entries(parsed).forEach(([convId, cache]) => {
      if (now - cache.lastUpdated <= CACHE_EXPIRATION_MS) {
        valid[convId] = {
          messages: deserializeMessages(cache.messages),
          lastUpdated: cache.lastUpdated,
        };
      }
    });

    // Save back if some entries were removed
    if (Object.keys(valid).length !== Object.keys(parsed).length) {
      const cleaned: Record<string, SerializedMessageCache> = {};
      Object.entries(valid).forEach(([convId, cache]) => {
        cleaned[convId] = {
          messages: serializeMessages(cache.messages),
          lastUpdated: cache.lastUpdated,
        };
      });
      localStorage.setItem(key, JSON.stringify(cleaned));
    }

    return valid;
  } catch (error) {
    console.error("Error loading messages cache:", error);
    return {};
  }
}

/**
 * Get messages for a specific conversation from cache
 */
export function getCachedMessages(
  userId: string,
  conversationId: string
): MessageWithSender[] | null {
  const cache = loadMessagesCache(userId);
  const cached = cache[conversationId];
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.lastUpdated > CACHE_EXPIRATION_MS) {
    // Cache expired, remove it
    delete cache[conversationId];
    try {
      const key = getMessagesCacheKey(userId);
      const cleaned: Record<string, SerializedMessageCache> = {};
      Object.entries(cache).forEach(([convId, cacheData]) => {
        cleaned[convId] = {
          messages: serializeMessages(cacheData.messages),
          lastUpdated: cacheData.lastUpdated,
        };
      });
      localStorage.setItem(key, JSON.stringify(cleaned));
    } catch (error) {
      console.error("Error cleaning expired cache:", error);
    }
    return null;
  }

  return cached.messages;
}

/**
 * Clear all messages cache for a user
 */
export function clearMessagesCache(userId: string): void {
  try {
    const key = getMessagesCacheKey(userId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error clearing messages cache:", error);
  }
}
