import type { ConversationWithParticipants } from "@/app/actions/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface ChatWindowHeaderProps {
  conversation: ConversationWithParticipants;
  currentUserId: string;
}

export function ChatWindowHeader({ conversation, currentUserId }: ChatWindowHeaderProps) {
  const otherParticipant =
    currentUserId === conversation.clientId
      ? { name: conversation.picName, avatar: conversation.picAvatar }
      : { name: conversation.clientName, avatar: conversation.clientAvatar };

  return (
    <div className="bg-background flex-shrink-0 border-b p-4">
      <div className="flex items-center gap-3">
        <Avatar
          className="h-10 w-10"
          style={{
            backgroundColor: otherParticipant.avatar ?? "#3b82f6",
          }}
        >
          <AvatarFallback className="text-sm text-white">
            {getInitials(otherParticipant.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{otherParticipant.name}</p>
          {conversation.projectName && (
            <p className="text-muted-foreground text-sm">{conversation.projectName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
