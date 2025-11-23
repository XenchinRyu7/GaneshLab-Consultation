/**
 * Contact list item component
 */

import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Trash2 } from "lucide-react";

import type { Contact } from "@/app/actions/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";

interface ContactListItemProps {
  contact: Contact;
  isSelected: boolean;
  onSelectContact: (contact: Contact) => void;
  onClearClick: (contactId: string, conversationId: string, contactName: string) => void;
  hasConversation: boolean;
}

export function ContactListItem({
  contact,
  isSelected,
  onSelectContact,
  onClearClick,
  hasConversation,
}: ContactListItemProps) {
  const hasUnread = contact.unreadCount > 0;

  return (
    <div
      className={cn(
        "group hover:bg-accent relative flex w-full items-center transition-colors",
        isSelected && "bg-accent"
      )}
    >
      <button
        onClick={() => onSelectContact(contact)}
        className="flex min-w-0 flex-1 items-start gap-3 p-4 text-left"
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback
            className="text-sm text-white"
            style={{ backgroundColor: contact.avatar ?? "#3b82f6" }}
          >
            {getInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <p className={cn("truncate font-medium", hasUnread && "font-semibold")}>
                {contact.name}
              </p>
              <Badge variant="outline" className="h-4 shrink-0 px-1.5 text-xs">
                {contact.role.toUpperCase()}
              </Badge>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              {contact.lastMessageAt && (
                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatDistanceToNow(new Date(contact.lastMessageAt), {
                    addSuffix: true,
                  })}
                </span>
              )}
              {hasUnread && (
                <span className="bg-primary text-primary-foreground flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-medium">
                  {contact.unreadCount > 99 ? "99+" : contact.unreadCount}
                </span>
              )}
            </div>
          </div>
          {contact.lastMessage ? (
            <p
              className={cn(
                "text-muted-foreground truncate text-sm",
                hasUnread && "text-foreground font-medium"
              )}
            >
              {contact.lastMessage}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm italic">No messages yet</p>
          )}
        </div>
      </button>
      {hasConversation && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={e => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                if (contact.conversationId) {
                  onClearClick(contact.id, contact.conversationId, contact.name);
                }
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
