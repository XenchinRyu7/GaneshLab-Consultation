/**
 * Hooks for contact selection logic in ChatClient
 */

import { useCallback } from "react";

import {
  getConversationById,
  getMessages,
  markMessagesAsRead,
  type Contact,
  type ConversationWithParticipants,
  type MessageWithSender,
} from "@/app/actions/chat";

/**
 * Load conversation and messages from server
 */
async function loadConversationData(conversationId: string) {
  const [conversationResult, messagesResult] = await Promise.all([
    getConversationById(conversationId),
    getMessages(conversationId),
  ]);

  const { conversation: loadedConversation, error: convError } = conversationResult;
  const { messages: conversationMessages, error: msgError } = messagesResult;

  return { loadedConversation, convError, conversationMessages, msgError };
}

/**
 * Load conversation data from server
 */
async function loadConversationFromServer(
  conversationId: string,
  setSelectedConversation: React.Dispatch<
    React.SetStateAction<ConversationWithParticipants | null>
  >,
  setMessages: React.Dispatch<React.SetStateAction<MessageWithSender[]>>,
  setIsLoadingMessages: React.Dispatch<React.SetStateAction<boolean>>,
  refreshContacts: () => Promise<void>
): Promise<void> {
  try {
    const { loadedConversation, convError, conversationMessages, msgError } =
      await loadConversationData(conversationId);

    if (convError || !loadedConversation) {
      console.error("❌ Error loading conversation:", convError);
      setIsLoadingMessages(false);
      return;
    }

    if (msgError) {
      console.error("❌ Error loading messages:", msgError);
    }

    setSelectedConversation(loadedConversation);

    // Ensure messages are sorted by createdAt before setting
    const sortedMessages = [...conversationMessages].sort((a, b) => {
      const aTime =
        a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const bTime =
        b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return aTime - bTime;
    });

    // Create a completely new array to force React reconciliation
    setMessages([...sortedMessages]);
    setIsLoadingMessages(false);

    await markMessagesAsRead(conversationId);

    setTimeout(() => {
      refreshContacts();
    }, 100);
  } catch (error) {
    console.error("❌ Error loading conversation/messages:", error);
    setIsLoadingMessages(false);
  }
}

/**
 * Hook for handling contact selection
 */
export function useSelectContact(
  setSelectedConversation: React.Dispatch<
    React.SetStateAction<ConversationWithParticipants | null>
  >,
  setMessages: React.Dispatch<React.SetStateAction<MessageWithSender[]>>,
  setIsLoadingMessages: React.Dispatch<React.SetStateAction<boolean>>,
  refreshContacts: () => Promise<void>
) {
  return useCallback(
    async (contact: Contact) => {
      const contactConversationId = contact.conversationId;

      if (!contactConversationId) {
        setSelectedConversation(null);
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      setMessages([]);

      await loadConversationFromServer(
        contactConversationId,
        setSelectedConversation,
        setMessages,
        setIsLoadingMessages,
        refreshContacts
      );
    },
    [setSelectedConversation, setMessages, setIsLoadingMessages, refreshContacts]
  );
}
