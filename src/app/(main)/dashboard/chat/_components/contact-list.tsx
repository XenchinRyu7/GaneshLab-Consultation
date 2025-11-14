"use client";

import { useState } from "react";

import type { Contact } from "@/app/actions/chat";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ContactListItem } from "./contact-list-item";

interface ContactListProps {
  contacts: Contact[];
  selectedContactId?: string | null;
  onSelectContact: (contact: Contact) => void;
  onClearConversation?: (contactId: string, conversationId: string) => void;
}

export function ContactList({
  contacts,
  selectedContactId,
  onSelectContact,
  onClearConversation,
}: ContactListProps) {
  const [clearingContact, setClearingContact] = useState<{
    contactId: string;
    conversationId: string;
    contactName: string;
  } | null>(null);

  if (contacts.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center p-4 text-center">
        <p>No contacts available</p>
      </div>
    );
  }

  const handleClearClick = (contactId: string, conversationId: string, contactName: string) => {
    setClearingContact({ contactId, conversationId, contactName });
  };

  const handleConfirmClear = () => {
    if (clearingContact && onClearConversation) {
      onClearConversation(clearingContact.contactId, clearingContact.conversationId);
    }
    setClearingContact(null);
  };

  return (
    <>
      <ScrollArea className="h-full">
        <div className="divide-y">
          {contacts.map(contact => {
            const isSelected = contact.id === selectedContactId;
            const hasConversation = contact.hasConversation && contact.conversationId;

            return (
              <ContactListItem
                key={contact.id}
                contact={contact}
                isSelected={isSelected}
                onSelectContact={onSelectContact}
                onClearClick={handleClearClick}
                hasConversation={!!(hasConversation && onClearConversation)}
              />
            );
          })}
        </div>
      </ScrollArea>

      <AlertDialog
        open={!!clearingContact}
        onOpenChange={open => !open && setClearingContact(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear the conversation with{" "}
              <strong>{clearingContact?.contactName}</strong>? All messages will be permanently
              deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClear}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear Conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
