/**
 * Chat cache utilities for localStorage persistence
 * Handles caching of messages and conversations with automatic expiration
 */

import type { MessageWithSender, ConversationWithParticipants } from "@/app/actions/chat";

interface MessageCache {
  messages: MessageWithSender[];
  lastUpdated: number;
}

interface ConversationCache {
  conversation: ConversationWithParticipants;
  lastUpdated: number;
}

// Cache expiration time: 7 days
const CACHE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

// localStorage keys
const getMessagesCacheKey = (userId: string) => `chat:messages:${userId}`;
const getConversationsCacheKey = (userId: string) => `chat:conversations:${userId}`;

/**
 * Serialize messages for localStorage (convert Date to ISO string)
 */
function serializeMessages(messages: MessageWithSender[]): any[] {
  return messages.map((msg) => ({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
    editedAt: msg.editedAt?.toISOString() || null,
    readAt: msg.readAt?.toISOString() || null,
  }));
}

/**
 * Deserialize messages from localStorage (convert ISO string to Date)
 */
function deserializeMessages(messages: any[]): MessageWithSender[] {
  return messages.map((msg) => ({
    ...msg,
    createdAt: new Date(msg.createdAt),
    editedAt: msg.editedAt ? new Date(msg.editedAt) : null,
    readAt: msg.readAt ? new Date(msg.readAt) : null,
  }));
}

/**
 * Serialize conversation for localStorage (convert Date to ISO string)
 */
function serializeConversation(conversation: ConversationWithParticipants): any {
  return {
    ...conversation,
    lastMessageAt: conversation.lastMessageAt?.toISOString() || null,
    createdAt: conversation.createdAt.toISOString(),
  };
}

/**
 * Deserialize conversation from localStorage (convert ISO string to Date)
 */
function deserializeConversation(conversation: any): ConversationWithParticipants {
  return {
    ...conversation,
    lastMessageAt: conversation.lastMessageAt ? new Date(conversation.lastMessageAt) : null,
    createdAt: new Date(conversation.createdAt),
  };
}

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
    
    // Update cache for this conversation
    existing[conversationId] = {
      messages: serializeMessages(messages),
      lastUpdated: Date.now(),
    };

    // Cleanup old cache entries
    const now = Date.now();
    Object.keys(existing).forEach((convId) => {
      if (now - existing[convId].lastUpdated > CACHE_EXPIRATION_MS) {
        delete existing[convId];
      }
    });

    localStorage.setItem(key, JSON.stringify(existing));
  } catch (error) {
    // Handle localStorage quota exceeded or other errors
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, clearing old cache");
      // Clear old cache and try again
      try {
        clearMessagesCache(userId);
        const key = getMessagesCacheKey(userId);
        const newCache: Record<string, MessageCache> = {
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

    const parsed = JSON.parse(cached);
    const now = Date.now();

    // Filter out expired cache entries
    const valid: Record<string, MessageCache> = {};
    Object.entries(parsed).forEach(([convId, cache]: [string, any]) => {
      if (now - cache.lastUpdated <= CACHE_EXPIRATION_MS) {
        valid[convId] = {
          messages: deserializeMessages(cache.messages),
          lastUpdated: cache.lastUpdated,
        };
      }
    });

    // Save back if some entries were removed
    if (Object.keys(valid).length !== Object.keys(parsed).length) {
      const cleaned: Record<string, any> = {};
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
      const cleaned: Record<string, any> = {};
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
 * Save conversation cache to localStorage
 */
export function saveConversationCache(
  userId: string,
  conversation: ConversationWithParticipants
): void {
  try {
    const key = getConversationsCacheKey(userId);
    const existing = loadConversationsCache(userId);
    
    // Update cache for this conversation
    existing[conversation.id] = {
      conversation: serializeConversation(conversation),
      lastUpdated: Date.now(),
    };

    // Cleanup old cache entries
    const now = Date.now();
    Object.keys(existing).forEach((convId) => {
      if (now - existing[convId].lastUpdated > CACHE_EXPIRATION_MS) {
        delete existing[convId];
      }
    });

    localStorage.setItem(key, JSON.stringify(existing));
  } catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, clearing old conversation cache");
      try {
        clearConversationsCache(userId);
        const key = getConversationsCacheKey(userId);
        const newCache: Record<string, ConversationCache> = {
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

    const parsed = JSON.parse(cached);
    const now = Date.now();

    // Filter out expired cache entries
    const valid: Record<string, ConversationCache> = {};
    Object.entries(parsed).forEach(([convId, cache]: [string, any]) => {
      if (now - cache.lastUpdated <= CACHE_EXPIRATION_MS) {
        valid[convId] = {
          conversation: deserializeConversation(cache.conversation),
          lastUpdated: cache.lastUpdated,
        };
      }
    });

    // Save back if some entries were removed
    if (Object.keys(valid).length !== Object.keys(parsed).length) {
      const cleaned: Record<string, any> = {};
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
      const cleaned: Record<string, any> = {};
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
    if (messagesCache[conversationId]) {
      delete messagesCache[conversationId];
      const key = getMessagesCacheKey(userId);
      const cleaned: Record<string, any> = {};
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
    if (conversationsCache[conversationId]) {
      delete conversationsCache[conversationId];
      const key = getConversationsCacheKey(userId);
      const cleaned: Record<string, any> = {};
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

