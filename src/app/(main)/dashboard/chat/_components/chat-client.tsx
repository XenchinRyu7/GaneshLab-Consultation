"use client";

import { useState, useCallback, useRef } from "react";

import { Search } from "lucide-react";

import {
  type Contact,
  type ConversationWithParticipants,
  type MessageWithSender,
} from "@/app/actions/chat";
import { Input } from "@/components/ui/input";
import type { User } from "@/lib/auth";
import { useUserStore } from "@/stores/user/user-provider";

import { useRefreshContacts } from "../_hooks/chat-client-contact-hooks";
import {
  useMessageSubscription,
  useConversationSubscription,
  useCache,
} from "../_hooks/chat-client-hooks";
import { useMessageHandlers } from "../_hooks/chat-client-message-hooks";
import { useSelectContact } from "../_hooks/chat-client-select-hooks";

import { ChatClientRender } from "./chat-client-render";
import type { MessageCache } from "./chat-client-types";
import { buildConversationForWindow, filterContacts } from "./chat-client-utils";
import { ContactList } from "./contact-list";

interface ChatClientProps {
  initialContacts: Contact[];
  currentUser: User | null;
}

export function ChatClient({ initialContacts, currentUser }: ChatClientProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithParticipants | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const messagesCacheRef = useRef<Map<string, MessageCache>>(new Map());
  const conversationsCacheRef = useRef<Map<string, ConversationWithParticipants>>(new Map());

  const storeUser = useUserStore(state => state.currentUser);
  const user = storeUser ?? currentUser;

  useCache({
    userId: user?.id,
    messagesCacheRef,
    conversationsCacheRef,
  });

  const refreshContacts = useRefreshContacts(
    selectedContact,
    selectedConversation,
    setContacts,
    setSelectedContact
  );

  useMessageSubscription({
    selectedConversation,
    userId: user?.id,
    setMessages,
    messagesCacheRef,
    refreshContacts,
  });

  useConversationSubscription(refreshContacts);

  const handleSelectContact = useSelectContact(
    user,
    messagesCacheRef,
    conversationsCacheRef,
    setSelectedConversation,
    setMessages,
    setIsLoadingMessages,
    refreshContacts
  );

  const onSelectContact = useCallback(
    (contact: Contact) => {
      setSelectedContact(contact);
      handleSelectContact(contact);
    },
    [handleSelectContact]
  );

  const { handleSendMessage, handleDeleteMessage, handleEditMessage, handleClearConversation } =
    useMessageHandlers({
      selectedContact,
      selectedConversation,
      user,
      setSelectedContact,
      setSelectedConversation,
      setMessages,
      messagesCacheRef,
      conversationsCacheRef,
      refreshContacts,
    });

  const filteredContacts = filterContacts(contacts, searchQuery);
  const conversationForWindow = buildConversationForWindow(
    selectedConversation,
    selectedContact,
    user
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 border-b">
        <div className="bg-background flex w-96 min-w-0 flex-col border-r">
          <div className="shrink-0 space-y-3 border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Chat</h2>
            </div>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <ContactList
              contacts={filteredContacts}
              selectedContactId={selectedContact?.id}
              onSelectContact={onSelectContact}
              onClearConversation={handleClearConversation}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <ChatClientRender
            selectedContact={selectedContact}
            conversationForWindow={conversationForWindow}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onEditMessage={handleEditMessage}
            currentUserId={user?.id ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
