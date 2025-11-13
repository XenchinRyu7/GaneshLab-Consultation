import { Clock, Monitor, MapPin, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  meetingType: "online" | "offline";
}

interface AvailabilitySlotCardProps {
  slot: AvailabilitySlot;
  dayOfWeek: string;
  index: number;
  isViewingOwnSchedule: boolean;
  onUpdate: (
    dayOfWeek: string,
    index: number,
    field: "startTime" | "endTime" | "meetingType",
    value: string
  ) => void;
  onRemove: (dayOfWeek: string, index: number) => void;
}

export function AvailabilitySlotCard({
  slot,
  dayOfWeek,
  index,
  isViewingOwnSchedule,
  onUpdate,
  onRemove,
}: AvailabilitySlotCardProps) {
  const getMeetingTypeColors = (meetingType: "online" | "offline") => {
    if (meetingType === "online") {
      return "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800";
    } else {
      return "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800";
    }
  };

  const getMeetingTypeIcon = (meetingType: "online" | "offline") => {
    if (meetingType === "online") {
      return <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    } else {
      return <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    }
  };

  const getMeetingTypeBadge = (meetingType: "online" | "offline") => {
    if (meetingType === "online") {
      return (
        <Badge
          variant="outline"
          className="border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
        >
          Online
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
        >
          Offline
        </Badge>
      );
    }
  };

  return (
    <div
      className={`flex flex-col gap-4 rounded-lg border-2 p-4 transition-colors sm:flex-row ${getMeetingTypeColors(slot.meetingType)}`}
    >
      <div className="flex flex-1 items-center gap-4">
        <div className="flex items-center gap-2">
          {getMeetingTypeIcon(slot.meetingType)}
          {getMeetingTypeBadge(slot.meetingType)}
        </div>
        {isViewingOwnSchedule ? (
          <>
            <div className="flex flex-1 items-center gap-2">
              <Clock className="text-muted-foreground h-4 w-4" />
              <Label className="w-20 text-sm">Start Time</Label>
              <TimePicker
                value={slot.startTime}
                onChange={value => onUpdate(dayOfWeek, index, "startTime", value)}
                id={`${dayOfWeek}-${index}-start`}
              />
            </div>
            <div className="flex flex-1 items-center gap-2">
              <Label className="w-20 text-sm">End Time</Label>
              <TimePicker
                value={slot.endTime}
                onChange={value => onUpdate(dayOfWeek, index, "endTime", value)}
                id={`${dayOfWeek}-${index}-end`}
              />
            </div>
            <div className="flex flex-1 items-center gap-2">
              <Label htmlFor={`${dayOfWeek}-${index}-type`} className="w-20 text-sm">
                Type
              </Label>
              <Select
                value={slot.meetingType}
                onValueChange={value => onUpdate(dayOfWeek, index, "meetingType", value)}
              >
                <SelectTrigger className="w-32" id={`${dayOfWeek}-${index}-type`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(dayOfWeek, index)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="ml-4 flex flex-1 items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground h-4 w-4" />
              <span className="text-sm font-medium">
                {slot.startTime} - {slot.endTime}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
