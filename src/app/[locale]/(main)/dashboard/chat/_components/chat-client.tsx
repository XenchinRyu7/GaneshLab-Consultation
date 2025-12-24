"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";

import { Menu, Search } from "lucide-react";

import {
  type Contact,
  type ConversationWithParticipants,
  type MessageWithSender,
} from "@/app/actions/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/lib/auth";
import { useUserStore } from "@/stores/user/user-provider";

import { useRefreshContacts } from "../_hooks/chat-client-contact-hooks";
import { useConversationSubscription } from "../_hooks/chat-client-conversation-hooks";
import { useMessageSubscription } from "../_hooks/chat-client-hooks";
import { useMessageHandlers } from "../_hooks/chat-client-message-hooks";
import { useSelectContact } from "../_hooks/chat-client-select-hooks";

import { ChatClientRender } from "./chat-client-render";
import { buildConversationForWindow, filterContacts } from "./chat-client-utils";
import { ContactList } from "./contact-list";

interface ChatClientProps {
  initialContacts: Contact[];
  currentUser: User | null;
}

const SELECTED_CONTACT_KEY = "chat_selected_contact_id";

export function ChatClient({ initialContacts, currentUser }: ChatClientProps) {
  const t = useTranslations("Chat");
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithParticipants | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const isMobile = useIsMobile();

  const storeUser = useUserStore(state => state.currentUser);
  const user = storeUser ?? currentUser;

  // Restore selected contact from localStorage after mount (to avoid hydration error)
  useEffect(() => {
    if (typeof window !== "undefined" && !selectedContact) {
      const savedContactId = localStorage.getItem(SELECTED_CONTACT_KEY);
      if (savedContactId) {
        const savedContact = initialContacts.find(c => c.id === savedContactId);
        if (savedContact) {
          setSelectedContact(savedContact);
        }
      }
    }
  }, [initialContacts, selectedContact]);

  // Auto-open sheet on mobile when no contact is selected
  useEffect(() => {
    if (isMobile && !selectedContact) {
      setMobileSheetOpen(true);
    }
  }, [isMobile, selectedContact]);

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
    refreshContacts,
    setContacts,
  });

  useConversationSubscription(refreshContacts, setContacts, user?.id);

  const handleSelectContact = useSelectContact(
    setSelectedConversation,
    setMessages,
    setIsLoadingMessages,
    refreshContacts
  );

  const onSelectContact = useCallback(
    (contact: Contact) => {
      setSelectedContact(contact);
      // Persist selected contact to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(SELECTED_CONTACT_KEY, contact.id);
      }
      handleSelectContact(contact);
      // Close mobile sheet when contact is selected
      if (isMobile) {
        setMobileSheetOpen(false);
      }
    },
    [handleSelectContact, isMobile]
  );

  // Auto-load conversation when selectedContact is restored from localStorage
  useEffect(() => {
    if (selectedContact && selectedContact.conversationId && !selectedConversation && user) {
      // Use setTimeout to avoid calling during render
      const timeoutId = setTimeout(() => {
        handleSelectContact(selectedContact);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact?.id, selectedConversation?.id, user?.id]);

  const { handleSendMessage, handleDeleteMessage, handleEditMessage, handleClearConversation } =
    useMessageHandlers({
      selectedContact,
      selectedConversation,
      user,
      setSelectedContact,
      setSelectedConversation,
      setMessages,
      refreshContacts,
    });

  const filteredContacts = filterContacts(contacts, searchQuery);
  const conversationForWindow = buildConversationForWindow(
    selectedConversation,
    selectedContact,
    user
  );

  const contactListContent = (
    <>
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
    </>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 border-b">
        {/* Desktop Sidebar */}
        <div className="bg-background hidden w-80 min-w-0 flex-col border-r md:flex lg:w-96">
          {contactListContent}
        </div>

        {/* Mobile Sheet */}
        {isMobile && (
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetContent side="left" className="w-[85vw] p-0 sm:w-[320px]">
              <SheetHeader className="sr-only">
                <SheetTitle>{t("contactsTitle")}</SheetTitle>
              </SheetHeader>
              <div className="bg-background flex h-full min-w-0 flex-col">{contactListContent}</div>
            </SheetContent>
          </Sheet>
        )}

        {/* Chat Window */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile Header with Menu Button */}
          {isMobile && !selectedContact && (
            <div className="bg-background shrink-0 border-b p-4">
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>
            </div>
          )}
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
            onBackToContacts={isMobile ? () => setMobileSheetOpen(true) : undefined}
          />
        </div>
      </div>
    </div>
  );
}
