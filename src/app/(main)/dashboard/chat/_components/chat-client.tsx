"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageSquare, Send, Search } from "lucide-react";
import type { User } from "@/lib/auth";
import type {
  Contact,
  ConversationWithParticipants,
  MessageWithSender,
} from "@/app/actions/chat";
import {
  getContacts,
  getConversationById,
  getMessages,
  sendMessage as sendMessageAction,
  deleteMessage as deleteMessageAction,
  editMessage as editMessageAction,
  deleteConversation as deleteConversationAction,
  markMessagesAsRead,
  getOrCreateConversation,
} from "@/app/actions/chat";
import { ContactList } from "./contact-list";
import { ChatWindow } from "./chat-window";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/stores/user/user-provider";
import { getInitials } from "@/lib/utils";
import {
  saveMessagesCache,
  loadMessagesCache,
  getCachedMessages,
  saveConversationCache,
  loadConversationsCache,
  getCachedConversation,
  removeConversationFromCache,
} from "@/lib/chat-cache";

interface ChatClientProps {
  initialContacts: Contact[];
  currentUser: User | null;
}

// Cache untuk messages dan conversations
interface MessageCache {
  messages: MessageWithSender[];
  lastUpdated: number;
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

  // Cache untuk messages per conversation
  const messagesCacheRef = useRef<Map<string, MessageCache>>(new Map());
  // Cache untuk conversations
  const conversationsCacheRef = useRef<Map<string, ConversationWithParticipants>>(new Map());

  // Use user from store if available, otherwise use currentUser from props
  const storeUser = useUserStore((state) => state.currentUser);
  const user = storeUser || currentUser;

  // Load cache from localStorage on mount
  useEffect(() => {
    if (!user?.id) return;

    try {
      // Load messages cache from localStorage
      const cachedMessages = loadMessagesCache(user.id);
      Object.entries(cachedMessages).forEach(([conversationId, cache]) => {
        messagesCacheRef.current.set(conversationId, cache);
      });

      // Load conversations cache from localStorage
      const cachedConversations = loadConversationsCache(user.id);
      Object.entries(cachedConversations).forEach(([conversationId, cache]) => {
        conversationsCacheRef.current.set(conversationId, cache.conversation);
      });
    } catch (error) {
      console.error("Error loading cache from localStorage:", error);
    }
  }, [user?.id]);

  // Refresh contacts callback - preserve selected contact by conversationId to avoid race conditions
  const refreshContacts = useCallback(async () => {
    const { contacts: updatedContacts } = await getContacts();

    // Store current state to prevent race conditions
    const currentSelectedContactId = selectedContact?.id;
    const currentConversationId = selectedConversation?.id || selectedContact?.conversationId;

    setContacts(updatedContacts);

    // Update selected contact if it exists, but preserve by conversationId to avoid race conditions
    if (currentSelectedContactId && currentConversationId) {
      // Try to find by conversationId first (most reliable - prevents mismatch)
      const updatedByConversation = updatedContacts.find(
        (c) => c.conversationId === currentConversationId
      );

      if (updatedByConversation) {
        // Only update if conversationId matches to prevent UI mismatch
        // This ensures chat board and contact list stay in sync
        setSelectedContact((prev) => {
          // Double-check that we're still on the same conversation
          if (prev && (prev.conversationId === currentConversationId || prev.id === currentSelectedContactId)) {
            return updatedByConversation;
          }
          return prev;
        });
      } else {
        // Fallback: update by contact ID only if conversationId still matches
        const updatedByContactId = updatedContacts.find((c) => c.id === currentSelectedContactId);
        if (updatedByContactId) {
          setSelectedContact((prev) => {
            // Only update if conversationId matches or if no conversation yet
            if (prev) {
              if (updatedByContactId.conversationId === currentConversationId ||
                (!prev.conversationId && !updatedByContactId.conversationId)) {
                return updatedByContactId;
              }
            }
            return prev;
          });
        }
      }
    } else if (currentSelectedContactId) {
      // If no conversationId, just update by contact ID
      const updated = updatedContacts.find((c) => c.id === currentSelectedContactId);
      if (updated) {
        setSelectedContact(updated);
      }
    }
  }, [selectedContact, selectedConversation]);

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!selectedConversation || !user?.id) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel(`conversation:${selectedConversation.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${selectedConversation.id}`,
          },
          async (payload: any) => {
            const newSenderId = payload.new?.sender_id;
            const newMessageId = payload.new?.id;

            // If this is our own message, we might already have it as optimistic
            // Fetch all messages from server
            const { messages: allMessages } = await getMessages(selectedConversation.id);

            // Update messages state, replacing optimistic with server messages
            setMessages((prev) => {
              // Create a map of server messages by content and timestamp (for matching optimistic)
              const serverMessageMap = new Map(allMessages.map(m => [m.id, m]));

              // Keep optimistic messages that haven't been confirmed by server yet
              // Match by checking if content and approximate timestamp match
              const updated = prev.map((prevMsg) => {
                // If it's a server message, use the server version
                if (serverMessageMap.has(prevMsg.id)) {
                  return serverMessageMap.get(prevMsg.id)!;
                }

                // If it's an optimistic message, check if server has a matching one
                if (prevMsg.tempId) {
                  // Try to find matching server message by content and sender
                  const matching = allMessages.find(
                    (m) =>
                      m.content === prevMsg.content &&
                      m.senderId === prevMsg.senderId &&
                      Math.abs(new Date(m.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) < 5000 // Within 5 seconds
                  );

                  if (matching) {
                    return { ...matching, status: "sent" as const };
                  }

                  // Keep optimistic if no match found yet
                  return prevMsg;
                }

                return prevMsg;
              });

              // Add any new server messages that aren't in our state
              const currentIds = new Set(updated.map(m => m.id));
              const newMessages = allMessages.filter(m => !currentIds.has(m.id));

              // Combine and sort
              const combined = [...updated, ...newMessages].sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );

              // Update memory cache
              const messageCache: MessageCache = {
                messages: combined,
                lastUpdated: Date.now(),
              };
              messagesCacheRef.current.set(selectedConversation.id, messageCache);

              // Save to localStorage
              if (user?.id) {
                saveMessagesCache(user.id, selectedConversation.id, combined);
              }

              return combined;
            });

            // Mark as read if it's from another user
            if (newSenderId !== user.id) {
              await markMessagesAsRead(selectedConversation.id);
            }

            // Defer refresh to prevent race condition with state updates
            setTimeout(() => {
              refreshContacts();
            }, 100);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${selectedConversation.id}`,
          },
          async (payload: any) => {
            // Handle message updates (edit/delete)
            const updatedMessageId = payload.new?.id;

            // Fetch updated message from server
            const { messages: allMessages } = await getMessages(selectedConversation.id);
            const updatedMessage = allMessages.find(m => m.id === updatedMessageId);

            if (updatedMessage) {
              setMessages((prev) => {
                const updatedMessages = prev.map((msg) =>
                  msg.id === updatedMessageId
                    ? { ...updatedMessage, status: msg.status, tempId: msg.tempId }
                    : msg
                );

                // Update memory cache
                const messageCache: MessageCache = {
                  messages: updatedMessages,
                  lastUpdated: Date.now(),
                };
                messagesCacheRef.current.set(selectedConversation.id, messageCache);

                // Save to localStorage
                if (user?.id) {
                  saveMessagesCache(user.id, selectedConversation.id, updatedMessages);
                }

                return updatedMessages;
              });
            }

            // Defer refresh to prevent race condition
            setTimeout(() => {
              refreshContacts();
            }, 100);
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to conversation:", selectedConversation.id);
          } else if (status === "CHANNEL_ERROR") {
            console.error("Error subscribing to conversation");
          }
        });
    } catch (error) {
      console.error("Error setting up real-time subscription:", error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [selectedConversation?.id, user?.id, refreshContacts]);

  // Set up real-time subscription for conversations
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel("conversations")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "conversations",
          },
          () => {
            refreshContacts();
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to conversations");
          } else if (status === "CHANNEL_ERROR") {
            console.error("Error subscribing to conversations");
          }
        });
    } catch (error) {
      console.error("Error setting up conversations subscription:", error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [refreshContacts]);

  const handleSelectContact = useCallback(
    async (contact: Contact) => {
      // Lock selected contact immediately to prevent race conditions
      setSelectedContact(contact);

      // Store conversationId for verification
      const contactConversationId = contact.conversationId;

      // If contact has conversation, load it
      if (contactConversationId) {
        const conversationId = contactConversationId;

        // Check cache first - show cached data immediately
        // Try memory cache first, then localStorage
        let cachedMessages = messagesCacheRef.current.get(conversationId);
        let cachedConversation = conversationsCacheRef.current.get(conversationId);

        // If not in memory, try localStorage
        if (!cachedMessages && user?.id) {
          const localMessages = getCachedMessages(user.id, conversationId);
          if (localMessages) {
            cachedMessages = {
              messages: localMessages,
              lastUpdated: Date.now(),
            };
            messagesCacheRef.current.set(conversationId, cachedMessages);
          }
        }

        if (!cachedConversation && user?.id) {
          const localConversation = getCachedConversation(user.id, conversationId);
          if (localConversation) {
            cachedConversation = localConversation;
            conversationsCacheRef.current.set(conversationId, cachedConversation);
          }
        }

        if (cachedMessages && cachedConversation) {
          // Show cached data immediately for instant UI
          setSelectedConversation(cachedConversation);
          setMessages(cachedMessages.messages);
          setIsLoadingMessages(false);

          // Mark as read in background
          markMessagesAsRead(conversationId).catch(console.error);
        } else {
          // No cache, show loading
          setIsLoadingMessages(true);
          setMessages([]);
        }

        // Load fresh data in parallel (conversation + messages)
        try {
          const [conversationResult, messagesResult] = await Promise.all([
            getConversationById(conversationId),
            getMessages(conversationId),
          ]);

          const { conversation: loadedConversation, error: convError } = conversationResult;
          const { messages: conversationMessages, error: msgError } = messagesResult;

          if (convError || !loadedConversation) {
            console.error("Error loading conversation:", convError);
            setIsLoadingMessages(false);
            return;
          }

          if (msgError) {
            console.error("Error loading messages:", msgError);
          }

          // Update memory cache
          conversationsCacheRef.current.set(conversationId, loadedConversation);
          if (conversationMessages) {
            const messageCache: MessageCache = {
              messages: conversationMessages,
              lastUpdated: Date.now(),
            };
            messagesCacheRef.current.set(conversationId, messageCache);

            // Save to localStorage
            if (user?.id) {
              saveMessagesCache(user.id, conversationId, conversationMessages);
              saveConversationCache(user.id, loadedConversation);
            }
          }

          // Verify conversationId still matches selected contact to prevent race condition
          // This ensures we don't update state if user switched contacts during loading
          if (contactConversationId === conversationId) {
            // Update state with fresh data
            setSelectedConversation(loadedConversation);
            setMessages(conversationMessages || []);

            // Mark messages as read
            await markMessagesAsRead(conversationId);
          }

          setIsLoadingMessages(false);

          // Refresh contacts after state is updated
          setTimeout(() => {
            refreshContacts();
          }, 100);
        } catch (error) {
          console.error("Error loading conversation/messages:", error);
          setIsLoadingMessages(false);
        }
      } else {
        // No conversation yet - will be created when first message is sent
        setSelectedConversation(null);
        setMessages([]);
      }
    },
    [user, refreshContacts]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedContact || !content.trim() || !user) return;

      let conversationId = selectedContact.conversationId;
      let conversation: ConversationWithParticipants | null = selectedConversation;

      // Create conversation if it doesn't exist
      if (!conversationId) {
        const { conversation: newConversation, error } = await getOrCreateConversation(
          selectedContact.id,
          null
        );

        if (error || !newConversation) {
          console.error("Error creating conversation:", error);
          return;
        }

        conversationId = newConversation.id;
        conversation = newConversation;

        // Update selected contact
        setSelectedContact((prev) =>
          prev
            ? {
              ...prev,
              conversationId: newConversation.id,
              hasConversation: true,
            }
            : null
        );
        // Update conversation state
        setSelectedConversation(newConversation);

        // Update memory cache
        conversationsCacheRef.current.set(newConversation.id, newConversation);

        // Load messages for the new conversation (should be empty initially)
        const emptyMessages: MessageWithSender[] = [];
        setMessages(emptyMessages);

        // Update messages cache
        const messageCache: MessageCache = {
          messages: emptyMessages,
          lastUpdated: Date.now(),
        };
        messagesCacheRef.current.set(newConversation.id, messageCache);

        // Save to localStorage
        if (user?.id) {
          saveConversationCache(user.id, newConversation);
          saveMessagesCache(user.id, newConversation.id, emptyMessages);
        }
      }

      // Create optimistic message
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticMessage: MessageWithSender = {
        id: tempId,
        tempId: tempId,
        conversationId: conversationId,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        content: content.trim(),
        isDeleted: false,
        editedAt: null,
        readAt: null,
        createdAt: new Date(),
        status: "sending",
      };

      // Add optimistic message immediately
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        // Send message to server
        const { message: serverMessage, error: sendError } = await sendMessageAction(
          conversationId,
          content
        );

        if (sendError || !serverMessage) {
          // Mark as error
          setMessages((prev) =>
            prev.map((msg) =>
              msg.tempId === tempId
                ? { ...msg, status: "error" as const }
                : msg
            )
          );
          console.error("Error sending message:", sendError);
          return;
        }

        // Replace optimistic message with server message
        setMessages((prev) => {
          const updatedMessages = prev.map((msg) =>
            msg.tempId === tempId
              ? { ...serverMessage, status: "sent" as const }
              : msg
          );

          // Update memory cache
          const messageCache: MessageCache = {
            messages: updatedMessages,
            lastUpdated: Date.now(),
          };
          messagesCacheRef.current.set(conversationId, messageCache);

          // Save to localStorage
          if (user?.id) {
            saveMessagesCache(user.id, conversationId, updatedMessages);
          }

          return updatedMessages;
        });

        // Refresh contacts to update last message and conversation list
        // Use setTimeout to defer refresh, preventing race condition with state updates
        setTimeout(() => {
          refreshContacts();
        }, 100);
      } catch (error) {
        // Mark as error on exception
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId
              ? { ...msg, status: "error" as const }
              : msg
          )
        );
        console.error("Error sending message:", error);
      }
    },
    [selectedContact, selectedConversation, user, refreshContacts]
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      const { success, error } = await deleteMessageAction(messageId);

      if (error || !success) {
        console.error("Error deleting message:", error);
        return;
      }

      // Update local state - mark message as deleted
      setMessages((prev) => {
        const updatedMessages = prev.map((msg) =>
          msg.id === messageId ? { ...msg, isDeleted: true, content: "" } : msg
        );

        // Update memory cache
        if (selectedConversation) {
          const messageCache: MessageCache = {
            messages: updatedMessages,
            lastUpdated: Date.now(),
          };
          messagesCacheRef.current.set(selectedConversation.id, messageCache);

          // Save to localStorage
          if (user?.id) {
            saveMessagesCache(user.id, selectedConversation.id, updatedMessages);
          }
        }

        return updatedMessages;
      });

      // Refresh contacts to update last message
      await refreshContacts();
    },
    [selectedConversation, user?.id, refreshContacts]
  );

  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const { message: updatedMessage, error } = await editMessageAction(
        messageId,
        newContent
      );

      if (error || !updatedMessage) {
        console.error("Error editing message:", error);
        return;
      }

      // Update local state
      setMessages((prev) => {
        const updatedMessages = prev.map((msg) =>
          msg.id === messageId
            ? { ...updatedMessage, status: msg.status, tempId: msg.tempId }
            : msg
        );

        // Update memory cache
        if (selectedConversation) {
          const messageCache: MessageCache = {
            messages: updatedMessages,
            lastUpdated: Date.now(),
          };
          messagesCacheRef.current.set(selectedConversation.id, messageCache);

          // Save to localStorage
          if (user?.id) {
            saveMessagesCache(user.id, selectedConversation.id, updatedMessages);
          }
        }

        return updatedMessages;
      });

      // Refresh contacts to update last message
      await refreshContacts();
    },
    [selectedConversation, user?.id, refreshContacts]
  );

  const handleClearConversation = useCallback(
    async (contactId: string, conversationId: string) => {
      const { success, error } = await deleteConversationAction(conversationId);

      if (error || !success) {
        console.error("Error clearing conversation:", error);
        return;
      }

      // Remove from memory cache
      messagesCacheRef.current.delete(conversationId);
      conversationsCacheRef.current.delete(conversationId);

      // Remove from localStorage cache
      if (user?.id) {
        removeConversationFromCache(user.id, conversationId);
      }

      // If this conversation is currently selected, clear it
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
        setSelectedContact(null);
      }

      // Refresh contacts to update the list
      await refreshContacts();
    },
    [user?.id, selectedConversation, refreshContacts]
  );

  // Filter contacts based on search
  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(search) ||
      contact.email.toLowerCase().includes(search) ||
      contact.lastMessage?.toLowerCase().includes(search)
    );
  });

  // Build conversation object for chat window
  // If we have a selected conversation, use it. Otherwise build from contact.
  const conversationForWindow: ConversationWithParticipants | null = selectedConversation
    ? selectedConversation
    : selectedContact
      ? {
        id: selectedContact.conversationId || "temp",
        clientId:
          user?.role === "client"
            ? user.id
            : selectedContact.role === "client"
              ? selectedContact.id
              : user?.id || "",
        clientName:
          user?.role === "client"
            ? user.name
            : selectedContact.role === "client"
              ? selectedContact.name
              : user?.name || "",
        clientAvatar:
          user?.role === "client"
            ? user.avatar
            : selectedContact.role === "client"
              ? selectedContact.avatar
              : user?.avatar,
        picId:
          user?.role === "pic"
            ? user.id
            : selectedContact.role === "pic"
              ? selectedContact.id
              : user?.id || "",
        picName:
          user?.role === "pic"
            ? user.name
            : selectedContact.role === "pic"
              ? selectedContact.name
              : user?.name || "",
        picAvatar:
          user?.role === "pic"
            ? user.avatar
            : selectedContact.role === "pic"
              ? selectedContact.avatar
              : user?.avatar,
        projectId: null,
        projectName: null,
        lastMessage: selectedContact.lastMessage || null,
        lastMessageAt: selectedContact.lastMessageAt || null,
        unreadCount: selectedContact.unreadCount,
        createdAt: new Date(),
      }
      : null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0 border-b">
        {/* Contact List Sidebar */}
        <div className="w-96 border-r bg-background flex flex-col min-w-0">
          <div className="flex-shrink-0 p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Chat</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ContactList
              contacts={filteredContacts}
              selectedContactId={selectedContact?.id}
              onSelectContact={handleSelectContact}
              onClearConversation={handleClearConversation}
              currentUserId={user?.id}
            />
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedContact && conversationForWindow ? (
            <ChatWindow
              conversation={conversationForWindow}
              messages={messages}
              isLoading={isLoadingMessages}
              onSendMessage={handleSendMessage}
              onDeleteMessage={handleDeleteMessage}
              onEditMessage={handleEditMessage}
              currentUserId={user?.id || ""}
            />
          ) : selectedContact ? (
            // Contact selected but no conversation yet - show empty chat
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-shrink-0 p-4 border-b bg-background">
                <div className="flex items-center gap-3">
                  <Avatar
                    className="h-10 w-10"
                    style={{
                      backgroundColor: selectedContact.avatar || "#3b82f6",
                    }}
                  >
                    <AvatarFallback className="text-white text-sm">
                      {getInitials(selectedContact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{selectedContact.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-4 overflow-hidden">
                <div className="text-center space-y-2">
                  <MessageSquare className="h-12 w-12 mx-auto opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
              <div className="flex-shrink-0 p-4 border-t bg-background">
                <div className="flex gap-2 items-end">
                  <Textarea
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (messageInput.trim() && selectedContact) {
                          handleSendMessage(messageInput);
                          setMessageInput("");
                        }
                      }
                    }}
                    className="min-h-[60px] max-h-[200px] resize-none"
                    rows={1}
                  />
                  <Button
                    onClick={() => {
                      if (messageInput.trim()) {
                        handleSendMessage(messageInput);
                        setMessageInput("");
                      }
                    }}
                    disabled={!messageInput.trim()}
                    size="icon"
                    className="h-10 w-10 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <MessageSquare className="h-12 w-12 mx-auto opacity-50" />
                <p>Select a contact to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
