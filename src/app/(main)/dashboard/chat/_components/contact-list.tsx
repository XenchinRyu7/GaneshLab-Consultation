"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn, getInitials } from "@/lib/utils";
import type { Contact } from "@/app/actions/chat";

interface ContactListProps {
  contacts: Contact[];
  selectedContactId?: string | null;
  onSelectContact: (contact: Contact) => void;
  onClearConversation?: (contactId: string, conversationId: string) => void;
  currentUserId?: string | null;
}

export function ContactList({
  contacts,
  selectedContactId,
  onSelectContact,
  onClearConversation,
  currentUserId,
}: ContactListProps) {
  const [clearingContact, setClearingContact] = useState<{
    contactId: string;
    conversationId: string;
    contactName: string;
  } | null>(null);

  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground">
        <p>No contacts available</p>
      </div>
    );
  }

  const handleClearClick = (contactId: string, conversationId: string, contactName: string) => {
    setClearingContact({ contactId, conversationId, contactName });
  };

  const handleConfirmClear = () => {
    if (clearingContact && onClearConversation) {
      onClearConversation(clearingContact.contactId, clearingContact.conversationId);
    }
    setClearingContact(null);
  };

  return (
    <>
      <ScrollArea className="h-full">
        <div className="divide-y">
          {contacts.map((contact) => {
            const isSelected = contact.id === selectedContactId;
            const hasUnread = contact.unreadCount > 0;
            const hasConversation = contact.hasConversation && contact.conversationId;

            return (
              <div
                key={contact.id}
                className={cn(
                  "group relative flex items-center w-full hover:bg-accent transition-colors",
                  isSelected && "bg-accent"
                )}
              >
                <button
                  onClick={() => onSelectContact(contact)}
                  className="flex items-start gap-3 flex-1 min-w-0 text-left p-4"
                >
                  <Avatar
                    className="h-10 w-10 shrink-0"
                    style={{
                      backgroundColor: contact.avatar || "#3b82f6",
                    }}
                  >
                    <AvatarFallback className="text-white text-sm">
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <p
                          className={cn(
                            "font-medium truncate",
                            hasUnread && "font-semibold"
                          )}
                        >
                          {contact.name}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-xs h-4 px-1.5 shrink-0"
                        >
                          {contact.role.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                        {contact.lastMessageAt && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(contact.lastMessageAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                        {hasUnread && (
                          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
                            {contact.unreadCount > 99 ? "99+" : contact.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    {contact.lastMessage ? (
                      <p
                        className={cn(
                          "text-sm text-muted-foreground truncate",
                          hasUnread && "text-foreground font-medium"
                        )}
                      >
                        {contact.lastMessage}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No messages yet
                      </p>
                    )}
                  </div>
                </button>
                {hasConversation && onClearConversation && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          if (contact.conversationId) {
                            handleClearClick(contact.id, contact.conversationId, contact.name);
                          }
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <AlertDialog open={!!clearingContact} onOpenChange={(open) => !open && setClearingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear the conversation with{" "}
              <strong>{clearingContact?.contactName}</strong>? All messages will be permanently deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClear}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear Conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

