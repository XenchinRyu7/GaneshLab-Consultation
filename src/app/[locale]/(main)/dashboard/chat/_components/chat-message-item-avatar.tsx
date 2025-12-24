/**
 * Message avatar component
 */

import type { MessageWithSender } from "@/app/actions/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface MessageAvatarProps {
  message: MessageWithSender;
  showAvatar: boolean;
}

export function MessageAvatar({ message, showAvatar }: MessageAvatarProps) {
  if (!showAvatar) {
    return <div className="h-8 w-8" />;
  }

  return (
    <Avatar className="h-8 w-8">
      <AvatarFallback
        className="text-xs text-white"
        style={{ backgroundColor: message.senderAvatar ?? "#3b82f6" }}
      >
        {getInitials(message.senderName)}
      </AvatarFallback>
    </Avatar>
  );
}
