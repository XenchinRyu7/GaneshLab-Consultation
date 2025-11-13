/**
 * Types for chat cache
 */

import type { MessageWithSender, ConversationWithParticipants } from "../_types";

export interface MessageCache {
  messages: MessageWithSender[];
  lastUpdated: number;
}

export interface ConversationCache {
  conversation: ConversationWithParticipants;
  lastUpdated: number;
}

// Cache expiration time: 7 days
export const CACHE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

// localStorage keys
export const getMessagesCacheKey = (userId: string) => `chat:messages:${userId}`;
export const getConversationsCacheKey = (userId: string) => `chat:conversations:${userId}`;
