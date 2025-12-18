"use client";

import { useState } from "react";

import type { ConversationWithParticipants, MessageWithSender } from "@/app/actions/chat";

import { useAutoScroll } from "../_hooks/chat-window-hooks";

import { ChatEditDialog } from "./chat-edit-dialog";
import { ChatMessageInput } from "./chat-message-input";
import { ChatMessageList } from "./chat-message-list";
import { ChatWindowHeader } from "./chat-window-header";

interface ChatWindowProps {
  conversation: ConversationWithParticipants;
  messages: MessageWithSender[];
  isLoading: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  currentUserId: string;
  onBackToContacts?: () => void;
}

export function ChatWindow({
  conversation,
  messages,
  isLoading,
  onSendMessage,
  onDeleteMessage,
  onEditMessage,
  currentUserId,
  onBackToContacts,
}: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState<MessageWithSender | null>(null);

  const { messagesEndRef, scrollContainerRef } = useAutoScroll(
    messages,
    isLoading,
    conversation.id
  );

  const handleSend = async () => {
    if (!messageInput.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(messageInput);
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = (message: MessageWithSender) => {
    setEditingMessage(message);
  };

  const handleSaveEdit = async (messageId: string, newContent: string) => {
    await onEditMessage(messageId, newContent);
    setEditingMessage(null);
  };

  const handleDelete = async (messageId: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await onDeleteMessage(messageId);
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  return (
    <>
      <div className="flex h-full max-h-full flex-col overflow-hidden">
        <ChatWindowHeader
          conversation={conversation}
          currentUserId={currentUserId}
          onBackToContacts={onBackToContacts}
        />

        <ChatMessageList
          messages={messages}
          isLoading={isLoading}
          currentUserId={currentUserId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          messagesEndRef={messagesEndRef}
          scrollContainerRef={scrollContainerRef}
        />

        <ChatMessageInput
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          isSending={isSending}
          onSend={handleSend}
        />
      </div>

      <ChatEditDialog
        editingMessage={editingMessage}
        onClose={() => setEditingMessage(null)}
        onSave={handleSaveEdit}
      />
    </>
  );
}
