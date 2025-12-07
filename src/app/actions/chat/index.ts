// Clean exports for chat module
// Main entry point for all chat functionality

// Types
export type { ConversationWithParticipants, MessageWithSender, Contact } from "./_types";

// Contacts
export { getContacts, getAvailablePICs } from "./_contacts";

// Messages
export {
  getMessages,
  sendMessage,
  deleteMessage,
  editMessage,
  markMessagesAsRead,
} from "./_messages";

// Conversations
export {
  getConversations,
  getConversationById,
  getOrCreateConversation,
  deleteConversation,
} from "./_conversations";

// Projects
export { getClientProjects } from "./_projects";

// Cache
export {
  saveConversationCache,
  loadConversationsCache,
  getCachedConversation,
  clearConversationsCache,
  saveMessagesCache,
  loadMessagesCache,
  getCachedMessages,
  clearMessagesCache,
  clearAllChatCache,
  removeConversationFromCache,
} from "./_cache";

