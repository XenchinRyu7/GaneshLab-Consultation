/**
 * Chat cache utilities for localStorage persistence
 * Re-exports all cache functions for convenience
 */

// Types
export type {
  MessageCache,
  ConversationCache,
  CACHE_EXPIRATION_MS,
  getMessagesCacheKey,
  getConversationsCacheKey,
} from "./chat-cache-types";

// Messages cache
export {
  saveMessagesCache,
  loadMessagesCache,
  getCachedMessages,
  clearMessagesCache,
} from "./chat-cache-messages";

// Conversations cache
export {
  saveConversationCache,
  loadConversationsCache,
  getCachedConversation,
  clearConversationsCache,
} from "./chat-cache-conversations";

// Utilities
export { clearAllChatCache, removeConversationFromCache } from "./chat-cache-utils";
