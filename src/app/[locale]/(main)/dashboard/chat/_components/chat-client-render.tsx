/**
 * Render components for ChatClient
 */

import { ArrowLeft, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

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
  onBackToContacts?: () => void;
}

/**
 * Render chat window when conversation exists
 */
function renderChatWindow(props: ChatClientRenderProps) {
  if (!props.selectedContact || !props.conversationForWindow) {
    return null;
  }

  return (
    <ChatWindow
      conversation={props.conversationForWindow}
      messages={props.messages}
      isLoading={props.isLoadingMessages}
      onSendMessage={props.onSendMessage}
      onDeleteMessage={props.onDeleteMessage}
      onEditMessage={props.onEditMessage}
      currentUserId={props.currentUserId}
      onBackToContacts={props.onBackToContacts}
    />
  );
}

/**
 * Render new conversation view (no conversation yet)
 */
function renderNewConversationView(props: ChatClientRenderProps, t: any) {
  if (!props.selectedContact) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="bg-background shrink-0 border-b p-3 md:p-4">
        <div className="flex items-center gap-2 md:gap-3">
          {props.onBackToContacts && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 md:hidden"
              onClick={props.onBackToContacts}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Avatar className="h-9 w-9 shrink-0 md:h-10 md:w-10">
            <AvatarFallback
              className="text-sm text-white"
              style={{ backgroundColor: props.selectedContact.avatar ?? "#3b82f6" }}
            >
              {getInitials(props.selectedContact.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold md:text-base">
              {props.selectedContact.name}
            </p>
            <p className="text-muted-foreground truncate text-xs md:text-sm">
              {props.selectedContact.email}
            </p>
          </div>
        </div>
      </div>
      <div className="text-muted-foreground flex flex-1 items-center justify-center overflow-hidden p-4">
        <div className="space-y-2 text-center">
          <MessageSquare className="mx-auto h-12 w-12 opacity-50" />
          <p>{t("noMessages")}</p>
        </div>
      </div>
      <div className="bg-background shrink-0 border-t p-3 md:p-4">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder={t("typeMessage")}
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
            className="max-h-[200px] min-h-[50px] resize-none text-sm md:min-h-[60px] md:text-base"
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
function renderEmptyState(t: any) {
  return (
    <div className="text-muted-foreground flex flex-1 items-center justify-center">
      <div className="space-y-2 text-center">
        <MessageSquare className="mx-auto h-12 w-12 opacity-50" />
        <p>{t("selectContact")}</p>
      </div>
    </div>
  );
}

/**
 * Render main chat content area
 */
export function ChatClientRender(props: ChatClientRenderProps) {
  const t = useTranslations("Chat");

  if (props.selectedContact && props.conversationForWindow) {
    return renderChatWindow(props);
  }

  if (props.selectedContact) {
    return renderNewConversationView(props, t);
  }

  return renderEmptyState(t);
}
