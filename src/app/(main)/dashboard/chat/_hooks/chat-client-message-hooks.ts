import { useCallback } from "react";

import {
  sendMessage as sendMessageAction,
  deleteMessage as deleteMessageAction,
  editMessage as editMessageAction,
  deleteConversation as deleteConversationAction,
  getOrCreateConversation,
  type MessageWithSender,
  type ConversationWithParticipants,
  type Contact,
} from "@/app/actions/chat";
import type { User } from "@/lib/auth";

interface UseMessageHandlersProps {
  selectedContact: Contact | null;
  selectedConversation: ConversationWithParticipants | null;
  user: User | null;
  setSelectedContact: React.Dispatch<React.SetStateAction<Contact | null>>;
  setSelectedConversation: React.Dispatch<
    React.SetStateAction<ConversationWithParticipants | null>
  >;
  setMessages: React.Dispatch<React.SetStateAction<MessageWithSender[]>>;
  refreshContacts: () => Promise<void>;
}

export function useMessageHandlers({
  selectedContact,
  selectedConversation,
  user,
  setSelectedContact,
  setSelectedConversation,
  setMessages,
  refreshContacts,
}: UseMessageHandlersProps) {
  const initializeNewConversation = useCallback(
    async (
      contactId: string
    ): Promise<{ conversationId: string; conversation: ConversationWithParticipants } | null> => {
      const { conversation: newConversation, error } = await getOrCreateConversation(
        contactId,
        null
      );

      if (error || !newConversation) {
        console.error("Error creating conversation:", error);
        return null;
      }

      setSelectedContact(prev =>
        prev
          ? {
              ...prev,
              conversationId: newConversation.id,
              hasConversation: true,
            }
          : null
      );
      setSelectedConversation(newConversation);

      const emptyMessages: MessageWithSender[] = [];
      setMessages(emptyMessages);

      return { conversationId: newConversation.id, conversation: newConversation };
    },
    [setSelectedContact, setSelectedConversation, setMessages]
  );

  const createOptimisticMessage = useCallback(
    (
      conversationId: string,
      content: string,
      userId: string,
      userName: string,
      userAvatar: string | null | undefined
    ): { message: MessageWithSender; tempId: string } => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticMessage: MessageWithSender = {
        id: tempId,
        tempId: tempId,
        conversationId: conversationId,
        senderId: userId,
        senderName: userName,
        senderAvatar: userAvatar ?? undefined,
        content: content.trim(),
        isDeleted: false,
        editedAt: null,
        readAt: null,
        createdAt: new Date(),
        status: "sending",
      };
      return { message: optimisticMessage, tempId };
    },
    []
  );

  const handleMessageSendError = useCallback(
    (tempId: string) => {
      setMessages(prev =>
        prev.map(msg => (msg.tempId === tempId ? { ...msg, status: "error" as const } : msg))
      );
    },
    [setMessages]
  );

  const handleMessageSendSuccess = useCallback(
    (tempId: string, serverMessage: MessageWithSender) => {
      setMessages(prev => {
        const updatedMessages = prev.map(msg =>
          msg.tempId === tempId ? { ...serverMessage, status: "sent" as const } : msg
        );

        return updatedMessages;
      });

      requestAnimationFrame(() => {
        refreshContacts().catch(err => {
          console.error("Error refreshing contacts:", err);
        });
      });
    },
    [setMessages, refreshContacts]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedContact || !content.trim() || !user) return;

      let conversationId = selectedContact.conversationId;

      if (!conversationId) {
        const result = await initializeNewConversation(selectedContact.id);
        if (!result) return;

        conversationId = result.conversationId;
      }

      const { message: optimisticMessage, tempId } = createOptimisticMessage(
        conversationId,
        content,
        user.id,
        user.name,
        user.avatar
      );
      setMessages(prev => [...prev, optimisticMessage]);

      try {
        const { message: serverMessage, error: sendError } = await sendMessageAction(
          conversationId,
          content
        );

        if (sendError || !serverMessage) {
          handleMessageSendError(tempId);
          console.error("Error sending message:", sendError);
          return;
        }

        handleMessageSendSuccess(tempId, serverMessage);
      } catch (error) {
        handleMessageSendError(tempId);
        console.error("Error sending message:", error);
      }
    },
    [
      selectedContact,
      user,
      initializeNewConversation,
      createOptimisticMessage,
      handleMessageSendError,
      handleMessageSendSuccess,
      setMessages,
    ]
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      const { success, error } = await deleteMessageAction(messageId);

      if (error || !success) {
        console.error("Error deleting message:", error);
        return;
      }

      setMessages(prev => {
        const updatedMessages = prev.map(msg =>
          msg.id === messageId ? { ...msg, isDeleted: true, content: "" } : msg
        );

        return updatedMessages;
      });

      await refreshContacts();
    },
    [setMessages, refreshContacts]
  );

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const { message: updatedMessage, error } = await editMessageAction(messageId, newContent);

      if (error) {
        console.error("Error editing message:", error);
        return;
      }

      if (!updatedMessage) {
        console.error("Error editing message: No message returned");
        return;
      }

      setMessages(prev => {
        const updatedMessages = prev.map(msg =>
          msg.id === messageId ? { ...updatedMessage, status: msg.status, tempId: msg.tempId } : msg
        );

        return updatedMessages;
      });

      await refreshContacts();
    },
    [setMessages, refreshContacts]
  );

  const handleClearConversation = useCallback(
    async (contactId: string, conversationId: string) => {
      const { success, error } = await deleteConversationAction(conversationId);

      if (error || !success) {
        console.error("Error clearing conversation:", error);
        return;
      }

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
        setSelectedContact(null);
      }

      await refreshContacts();
    },
    [
      selectedConversation,
      setSelectedConversation,
      setMessages,
      setSelectedContact,
      refreshContacts,
    ]
  );

  return {
    handleSendMessage,
    handleDeleteMessage,
    handleEditMessage,
    handleClearConversation,
  };
}
