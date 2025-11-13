import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AvailabilitySlotCard } from "./availability-slot-card";

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  meetingType: "online" | "offline";
}

interface AvailabilityDaySectionProps {
  day: { value: string; label: string };
  slots: AvailabilitySlot[];
  isViewingOwnSchedule: boolean;
  onAddSlot: (dayOfWeek: string) => void;
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
  slots,
  isViewingOwnSchedule,
  onAddSlot,
  onUpdateSlot,
  onRemoveSlot,
}: AvailabilityDaySectionProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-medium">{day.label}</div>
        {isViewingOwnSchedule && (
          <Button type="button" variant="outline" size="sm" onClick={() => onAddSlot(day.value)}>
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
              key={index}
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
