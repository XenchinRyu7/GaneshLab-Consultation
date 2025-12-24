import { ArrowLeft } from "lucide-react";

import type { ConversationWithParticipants } from "@/app/actions/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { getInitials } from "@/lib/utils";

interface ChatWindowHeaderProps {
  conversation: ConversationWithParticipants;
  currentUserId: string;
  onBackToContacts?: () => void;
}

export function ChatWindowHeader({
  conversation,
  currentUserId,
  onBackToContacts,
}: ChatWindowHeaderProps) {
  const isMobile = useIsMobile();
  const otherParticipant =
    currentUserId === conversation.clientId
      ? { name: conversation.picName, avatar: conversation.picAvatar }
      : { name: conversation.clientName, avatar: conversation.clientAvatar };

  return (
    <div className="bg-background shrink-0 border-b p-3 md:p-4">
      <div className="flex items-center gap-2 md:gap-3">
        {isMobile && onBackToContacts && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 md:hidden"
            onClick={onBackToContacts}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <Avatar className="h-9 w-9 shrink-0 md:h-10 md:w-10">
          <AvatarFallback
            className="text-sm text-white"
            style={{ backgroundColor: otherParticipant.avatar ?? "#3b82f6" }}
          >
            {getInitials(otherParticipant.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold md:text-base">{otherParticipant.name}</p>
          {conversation.projectName && (
            <p className="text-muted-foreground truncate text-xs md:text-sm">
              {conversation.projectName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
