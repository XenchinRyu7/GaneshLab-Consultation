/**
 * Render components for ChatClient
 */

import { MessageSquare } from "lucide-react";

import type { Contact, ConversationWithParticipants, MessageWithSender } from "@/app/actions/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getInitials } from "@/lib/utils";

import { ChatWindow } from "./chat-window";

interface ChatClientRenderProps {
  selectedContact: Contact | null;
  conversationForWindow: ConversationWithParticipants | null;
  messages: MessageWithSender[];
  isLoadingMessages: boolean;
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSendMessage: (content: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  currentUserId: string;
}

/**
 * Render chat window when conversation exists
 */
function renderChatWindow(props: ChatClientRenderProps) {
  if (!props.selectedContact || !props.conversationForWindow) return null;

  return (
    <ChatWindow
      conversation={props.conversationForWindow}
      messages={props.messages}
      isLoading={props.isLoadingMessages}
      onSendMessage={props.onSendMessage}
      onDeleteMessage={props.onDeleteMessage}
      onEditMessage={props.onEditMessage}
      currentUserId={props.currentUserId}
    />
  );
}

/**
 * Render new conversation view (no conversation yet)
 */
function renderNewConversationView(props: ChatClientRenderProps) {
  if (!props.selectedContact) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="bg-background shrink-0 border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback
              className="text-sm text-white"
              style={{ backgroundColor: props.selectedContact.avatar ?? "#3b82f6" }}
            >
              {getInitials(props.selectedContact.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">{props.selectedContact.name}</p>
            <p className="text-muted-foreground text-sm">{props.selectedContact.email}</p>
          </div>
        </div>
      </div>
      <div className="text-muted-foreground flex flex-1 items-center justify-center overflow-hidden p-4">
        <div className="space-y-2 text-center">
          <MessageSquare className="mx-auto h-12 w-12 opacity-50" />
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
      <div className="bg-background shrink-0 border-t p-4">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Type a message..."
            value={props.messageInput}
            onChange={e => props.setMessageInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (props.messageInput.trim() && props.selectedContact) {
                  props.onSendMessage(props.messageInput);
                  props.setMessageInput("");
                }
              }
            }}
            className="max-h-[200px] min-h-[60px] resize-none"
            rows={1}
          />
          <Button
            onClick={() => {
              if (props.messageInput.trim()) {
                props.onSendMessage(props.messageInput);
                props.setMessageInput("");
              }
            }}
            disabled={!props.messageInput.trim()}
            size="icon"
            className="h-10 w-10 shrink-0"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Render empty state (no contact selected)
 */
function renderEmptyState() {
  return (
    <div className="text-muted-foreground flex flex-1 items-center justify-center">
      <div className="space-y-2 text-center">
        <MessageSquare className="mx-auto h-12 w-12 opacity-50" />
        <p>Select a contact to start chatting</p>
      </div>
    </div>
  );
}

/**
 * Render main chat content area
 */
export function ChatClientRender(props: ChatClientRenderProps) {
  if (props.selectedContact && props.conversationForWindow) {
    return renderChatWindow(props);
  }

  if (props.selectedContact) {
    return renderNewConversationView(props);
  }

  return renderEmptyState();
}
