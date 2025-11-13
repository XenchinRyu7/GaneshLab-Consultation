"use client";

import { formatDistanceToNow } from "date-fns";

import type { ConversationWithParticipants } from "@/app/actions/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getInitials } from "@/lib/utils";

interface ConversationListProps {
  conversations: ConversationWithParticipants[];
  selectedConversationId?: string | null;
  onSelectConversation: (conversation: ConversationWithParticipants) => void;
  currentUserId?: string | null;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center p-4 text-center">
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y">
        {conversations.map(conversation => {
          const otherParticipant =
            currentUserId === conversation.clientId
              ? { name: conversation.picName, avatar: conversation.picAvatar }
              : { name: conversation.clientName, avatar: conversation.clientAvatar };

          const isSelected = conversation.id === selectedConversationId;
          const hasUnread = conversation.unreadCount > 0;

          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={cn(
                "hover:bg-accent w-full p-4 text-left transition-colors",
                isSelected && "bg-accent"
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar
                  className="h-10 w-10"
                  style={{
                    backgroundColor: otherParticipant.avatar ?? "#3b82f6",
                  }}
                >
                  <AvatarFallback className="text-sm text-white">
                    {getInitials(otherParticipant.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className={cn("truncate font-medium", hasUnread && "font-semibold")}>
                      {otherParticipant.name}
                    </p>
                    {conversation.lastMessageAt && (
                      <span className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {conversation.projectName && (
                      <span className="text-muted-foreground truncate text-xs">
                        {conversation.projectName}
                      </span>
                    )}
                    {conversation.lastMessage && (
                      <p
                        className={cn(
                          "text-muted-foreground flex-1 truncate text-sm",
                          hasUnread && "text-foreground font-medium"
                        )}
                      >
                        {conversation.lastMessage}
                      </p>
                    )}
                  </div>
                  {hasUnread && (
                    <div className="mt-1">
                      <Badge variant="default" className="h-5 text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
