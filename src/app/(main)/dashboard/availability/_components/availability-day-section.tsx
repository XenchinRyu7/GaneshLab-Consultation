import { format } from "date-fns";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AvailabilitySlotCard } from "./availability-slot-card";

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  meetingType: "online" | "offline";
  date?: string;
}

interface AvailabilityDaySectionProps {
  day: { value: string; label: string };
  dayDate?: Date;
  slots: AvailabilitySlot[];
  isViewingOwnSchedule: boolean;
  onAddSlot: () => void;
  onUpdateSlot: (
    dayOfWeek: string,
    index: number,
    field: "startTime" | "endTime" | "meetingType",
    value: string
  ) => void;
  onRemoveSlot: (dayOfWeek: string, index: number) => void;
}

export function AvailabilityDaySection({
  day,
  dayDate,
  slots,
  isViewingOwnSchedule,
  onAddSlot,
  onUpdateSlot,
  onRemoveSlot,
}: AvailabilityDaySectionProps) {
  return (
    <div className="space-y-3 rounded-lg border p-3 sm:space-y-4 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-base font-medium sm:text-lg">{day.label}</div>
          {dayDate && (
            <div className="text-muted-foreground text-xs sm:text-sm">
              {format(dayDate, "MMMM d, yyyy")}
            </div>
          )}
        </div>
        {isViewingOwnSchedule && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddSlot}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Slot
          </Button>
        )}
      </div>

      {slots.length === 0 ? (
        <div className="text-muted-foreground py-4 text-center text-sm">
          No time slots added. Click &quot;Add Slot&quot; to add availability.
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map((slot, index) => (
            <AvailabilitySlotCard
              key={
                slot.id ??
                `${day.value}-${slot.startTime}-${slot.endTime}-${slot.meetingType}-${index}`
              }
              slot={slot}
              dayOfWeek={day.value}
              index={index}
              isViewingOwnSchedule={isViewingOwnSchedule}
              onUpdate={onUpdateSlot}
              onRemove={onRemoveSlot}
            />
          ))}
        </div>
      )}
    </div>
  );
}
