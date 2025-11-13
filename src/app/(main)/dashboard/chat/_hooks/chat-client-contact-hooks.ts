/**
 * Hooks for contact management in ChatClient
 */

import { useCallback } from "react";

import { getContacts, type Contact, type ConversationWithParticipants } from "@/app/actions/chat";

/**
 * Update selected contact when contacts list is refreshed
 */
function updateSelectedContactAfterRefresh(
  updatedContacts: Contact[],
  currentSelectedContactId: string | undefined,
  currentConversationId: string | undefined,
  setSelectedContact: React.Dispatch<React.SetStateAction<Contact | null>>
) {
  if (!currentSelectedContactId || !currentConversationId) {
    if (currentSelectedContactId) {
      const updated = updatedContacts.find(c => c.id === currentSelectedContactId);
      if (updated) {
        setSelectedContact(updated);
      }
    }
    return;
  }

  const updatedByConversation = updatedContacts.find(
    c => c.conversationId === currentConversationId
  );

  if (updatedByConversation) {
    setSelectedContact(prev => {
      if (
        prev &&
        (prev.conversationId === currentConversationId || prev.id === currentSelectedContactId)
      ) {
        return updatedByConversation;
      }
      return prev;
    });
    return;
  }

  const updatedByContactId = updatedContacts.find(c => c.id === currentSelectedContactId);
  if (updatedByContactId) {
    setSelectedContact(prev => {
      if (prev) {
        if (
          updatedByContactId.conversationId === currentConversationId ||
          (!prev.conversationId && !updatedByContactId.conversationId)
        ) {
          return updatedByContactId;
        }
      }
      return prev;
    });
  }
}

/**
 * Hook for refreshing contacts list
 */
export function useRefreshContacts(
  selectedContact: Contact | null,
  selectedConversation: ConversationWithParticipants | null,
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>,
  setSelectedContact: React.Dispatch<React.SetStateAction<Contact | null>>
) {
  return useCallback(async () => {
    const { contacts: updatedContacts } = await getContacts();

    const currentSelectedContactId = selectedContact?.id;
    const currentConversationId = selectedConversation?.id ?? selectedContact?.conversationId;

    setContacts(updatedContacts);

    updateSelectedContactAfterRefresh(
      updatedContacts,
      currentSelectedContactId,
      currentConversationId,
      setSelectedContact
    );
  }, [selectedContact, selectedConversation, setContacts, setSelectedContact]);
}
