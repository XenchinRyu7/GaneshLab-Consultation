/**
 * Message content component
 */

import { MoreVertical, Trash2, Edit2 } from "lucide-react";

import type { MessageWithSender } from "@/app/actions/chat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MessageContentProps {
  message: MessageWithSender;
  isOwnMessage: boolean;
  onEdit: (message: MessageWithSender) => void;
  onDelete: (messageId: string) => void;
}

export function MessageContent({ message, isOwnMessage, onEdit, onDelete }: MessageContentProps) {
  return (
    <div className="group flex items-end gap-2">
      <div
        className={cn(
          "relative rounded-lg px-4 py-2",
          isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted",
          message.status === "sending" && "opacity-70",
          message.isDeleted && "italic opacity-50"
        )}
      >
        {message.isDeleted ? (
          <p className="text-muted-foreground text-sm">This message was deleted</p>
        ) : (
          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
        )}
        {message.editedAt && !message.isDeleted && (
          <span className="ml-2 text-xs opacity-70">(edited)</span>
        )}
      </div>
      {isOwnMessage && !message.isDeleted && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(message)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(message.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
