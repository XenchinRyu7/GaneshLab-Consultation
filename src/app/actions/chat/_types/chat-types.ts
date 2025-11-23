export interface ConversationWithParticipants {
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
  lastMessageAt: Date | null;
  unreadCount: number;
  createdAt: Date;
}

export interface MessageWithSender {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  isDeleted: boolean;
  editedAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
  status?: "sending" | "sent" | "error"; // For optimistic updates
  tempId?: string; // Temporary ID for optimistic messages
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  role: "client" | "pic" | "admin";
  hasConversation: boolean;
  conversationId?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
}
