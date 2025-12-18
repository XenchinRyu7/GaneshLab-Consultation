import { useMemo } from "react";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import type { MessageWithSender } from "@/app/actions/chat";

import { ChatMessageItem } from "./chat-message-item";

interface ChatMessageListProps {
  messages: MessageWithSender[];
  isLoading: boolean;
  currentUserId: string;
  onEdit: (message: MessageWithSender) => void;
  onDelete: (messageId: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessageList({
  messages,
  isLoading,
  currentUserId,
  onEdit,
  onDelete,
  messagesEndRef,
  scrollContainerRef,
}: ChatMessageListProps) {
  const groupedMessages = useMemo(() => {
    return messages.reduce(
      (groups, message) => {
        let createdAt: Date;
        if (message.createdAt instanceof Date) {
          createdAt = message.createdAt;
        } else if (typeof message.createdAt === "string") {
          createdAt = new Date(message.createdAt);
        } else {
          createdAt = new Date(message.createdAt);
        }

        if (isNaN(createdAt.getTime())) {
          createdAt = new Date();
        }

        const date = format(createdAt, "yyyy-MM-dd");
        if (!(date in groups)) {
          groups[date] = [];
        }
        groups[date].push(message);
        return groups;
      },
      {} as Record<string, MessageWithSender[]>
    );
  }, [messages]);

  return (
    <div
      ref={scrollContainerRef}
      className="min-h-0 flex-1 overflow-y-auto p-3 md:p-4"
      style={{ scrollBehavior: "smooth" }}
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-muted-foreground py-8 text-center">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="my-4 flex items-center justify-center">
                <div className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
                  {format(new Date(date), "MMMM d, yyyy")}
                </div>
              </div>
              {dateMessages.map((message, index) => {
                const isOwnMessage = message.senderId === currentUserId;
                const showAvatar =
                  index === 0 || dateMessages[index - 1]?.senderId !== message.senderId;
                const showTimestamp =
                  index === dateMessages.length - 1 ||
                  dateMessages[index + 1]?.senderId !== message.senderId;

                return (
                  <ChatMessageItem
                    key={message.tempId ?? message.id}
                    message={message}
                    isOwnMessage={isOwnMessage}
                    showAvatar={showAvatar}
                    showTimestamp={showTimestamp}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
