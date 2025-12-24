import type { MessageWithSender } from "@/app/actions/chat";
import { cn } from "@/lib/utils";

import { MessageAvatar } from "./chat-message-item-avatar";
import { MessageContent } from "./chat-message-item-content";
import { MessageTimestamp } from "./chat-message-item-timestamp";

interface ChatMessageItemProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  onEdit: (message: MessageWithSender) => void;
  onDelete: (messageId: string) => void;
}

export function ChatMessageItem({
  message,
  isOwnMessage,
  showAvatar,
  showTimestamp,
  onEdit,
  onDelete,
}: ChatMessageItemProps) {
  return (
    <div className={cn("group mb-2 flex gap-3", isOwnMessage ? "justify-end" : "justify-start")}>
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          <MessageAvatar message={message} showAvatar={showAvatar} />
        </div>
      )}
      <div
        className={cn(
          "flex max-w-[85%] flex-col md:max-w-[70%]",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        {showAvatar && !isOwnMessage && (
          <p className="text-muted-foreground mb-1 px-2 text-xs">{message.senderName}</p>
        )}
        <MessageContent
          message={message}
          isOwnMessage={isOwnMessage}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        <MessageTimestamp
          message={message}
          isOwnMessage={isOwnMessage}
          showTimestamp={showTimestamp}
        />
      </div>
      {isOwnMessage && (
        <div className="flex-shrink-0">
          <MessageAvatar message={message} showAvatar={showAvatar} />
        </div>
      )}
    </div>
  );
}
