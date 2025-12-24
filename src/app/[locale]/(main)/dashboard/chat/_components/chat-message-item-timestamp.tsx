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

  // Ensure createdAt is properly parsed as Date object
  const messageDate =
    message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt);

  const formattedTime = format(messageDate, "h:mm a");

  return (
    <div className="mt-1 flex items-center gap-1 px-2">
      <p className="text-muted-foreground text-xs">{formattedTime}</p>
      {isOwnMessage && !message.isDeleted && <MessageStatusIcon message={message} />}
    </div>
  );
}
