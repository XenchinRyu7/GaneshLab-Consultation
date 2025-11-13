/**
 * Message timestamp component
 */

import { format } from "date-fns";

import type { MessageWithSender } from "@/app/actions/chat";

import { MessageStatusIcon } from "./chat-message-item-status";

interface MessageTimestampProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
  showTimestamp: boolean;
}

export function MessageTimestamp({ message, isOwnMessage, showTimestamp }: MessageTimestampProps) {
  if (!showTimestamp && !isOwnMessage) {
    return null;
  }

  return (
    <div className="mt-1 flex items-center gap-1 px-2">
      <p className="text-muted-foreground text-xs">
        {format(new Date(message.createdAt), "h:mm a")}
      </p>
      {isOwnMessage && !message.isDeleted && <MessageStatusIcon message={message} />}
    </div>
  );
}
