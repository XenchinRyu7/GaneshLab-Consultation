/**
 * Message status icon component
 */

import { Clock, CheckCircle2, XCircle } from "lucide-react";

import type { MessageWithSender } from "@/app/actions/chat";

interface MessageStatusIconProps {
  message: MessageWithSender;
}

export function MessageStatusIcon({ message }: MessageStatusIconProps) {
  if (message.status === "sending") {
    return <Clock className="text-muted-foreground h-3 w-3" />;
  }
  if (message.status === "error") {
    return <XCircle className="text-destructive h-3 w-3" />;
  }
  if (message.readAt) {
    return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
  }
  return <CheckCircle2 className="text-muted-foreground h-3 w-3" />;
}
