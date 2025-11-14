/**
 * Helper functions for chat cache serialization/deserialization
 */

import type { MessageWithSender, ConversationWithParticipants } from "../_types";

// Serialized types for localStorage (Date becomes string)
export interface SerializedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  isDeleted: boolean;
  editedAt: string | null;
  readAt: string | null;
  createdAt: string;
  status?: "sending" | "sent" | "error";
  tempId?: string;
}

export interface SerializedConversation {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  picId: string;
  picName: string;
  picAvatar?: string;
  projectId: string | null;
  projectName: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
}

export interface SerializedMessageCache {
  messages: SerializedMessage[];
  lastUpdated: number;
}

export interface SerializedConversationCache {
  conversation: SerializedConversation;
  lastUpdated: number;
}

/**
 * Serialize messages for localStorage (convert Date to ISO string)
 */
export function serializeMessages(messages: MessageWithSender[]): SerializedMessage[] {
  return messages.map(msg => ({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
    editedAt: msg.editedAt?.toISOString() ?? null,
    readAt: msg.readAt?.toISOString() ?? null,
  }));
}

/**
 * Deserialize messages from localStorage (convert ISO string to Date)
 */
export function deserializeMessages(messages: SerializedMessage[]): MessageWithSender[] {
  return messages.map(msg => ({
    ...msg,
    createdAt: new Date(msg.createdAt),
    editedAt: msg.editedAt ? new Date(msg.editedAt) : null,
    readAt: msg.readAt ? new Date(msg.readAt) : null,
  }));
}

/**
 * Serialize conversation for localStorage (convert Date to ISO string)
 */
export function serializeConversation(
  conversation: ConversationWithParticipants
): SerializedConversation {
  return {
    ...conversation,
    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
    createdAt: conversation.createdAt.toISOString(),
  };
}

/**
 * Deserialize conversation from localStorage (convert ISO string to Date)
 */
export function deserializeConversation(
  conversation: SerializedConversation
): ConversationWithParticipants {
  return {
    ...conversation,
    lastMessageAt: conversation.lastMessageAt ? new Date(conversation.lastMessageAt) : null,
    createdAt: new Date(conversation.createdAt),
  };
}
