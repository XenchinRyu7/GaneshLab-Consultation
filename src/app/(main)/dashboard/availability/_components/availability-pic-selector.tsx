import { Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials } from "@/lib/utils";

interface PIC {
  id: string;
  fullname: string;
  email: string;
  avatarColor?: string | null;
}

interface AvailabilityPICSelectorProps {
  pics: PIC[];
  selectedPicId: string | null;
  currentUserId: string | undefined;
  onPicChange: (picId: string) => void;
}

export function AvailabilityPICSelector({
  pics,
  selectedPicId,
  currentUserId,
  onPicChange,
}: AvailabilityPICSelectorProps) {
  if (pics.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <Users className="text-muted-foreground h-5 w-5" />
      <Select value={selectedPicId ?? ""} onValueChange={onPicChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select PIC" />
        </SelectTrigger>
        <SelectContent>
          {pics.map(pic => (
            <SelectItem key={pic.id} value={pic.id}>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback
                    className="text-xs text-white"
                    style={{ backgroundColor: pic.avatarColor ?? "#3b82f6" }}
                  >
                    {getInitials(pic.fullname)}
                  </AvatarFallback>
                </Avatar>
                <span>{pic.fullname}</span>
                {pic.id === currentUserId && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    You
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
