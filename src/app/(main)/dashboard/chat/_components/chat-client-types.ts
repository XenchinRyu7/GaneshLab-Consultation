import type { Contact, ConversationWithParticipants, MessageWithSender } from "@/app/actions/chat";

// Type for Supabase postgres_changes payload
export interface SupabasePayload {
  new?: {
    id?: string;
    sender_id?: string;
    conversation_id?: string;
    content?: string;
    created_at?: string;
    [key: string]: unknown;
  };
  old?: {
    id?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Cache untuk messages dan conversations
export interface MessageCache {
  messages: MessageWithSender[];
  lastUpdated: number;
}

export interface ChatClientState {
  contacts: Contact[];
  selectedContact: Contact | null;
  selectedConversation: ConversationWithParticipants | null;
  messages: MessageWithSender[];
  isLoadingMessages: boolean;
  searchQuery: string;
  messageInput: string;
}
