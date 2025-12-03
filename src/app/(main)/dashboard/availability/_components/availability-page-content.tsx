/**
 * Main content component for AvailabilityPage
 */

import { Calendar, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { AvailabilitySlot } from "../_hooks/availability-page-hooks";

import { AvailabilityDaySection } from "./availability-day-section";
import { GoogleCalendarStatus } from "./google-calendar-status";

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

interface AvailabilityPageContentProps {
  availabilities: Record<string, AvailabilitySlot[]>;
  isViewingOwnSchedule: boolean;
  onAddSlot: (dayOfWeek: string) => void;
  onUpdateSlot: (
    dayOfWeek: string,
    index: number,
    field: "startTime" | "endTime" | "meetingType",
    value: string
  ) => void;
  onRemoveSlot: (dayOfWeek: string, index: number) => void;
  saving: boolean;
  onSave: () => void;
}

export function AvailabilityPageContent({
  availabilities,
  isViewingOwnSchedule,
  onAddSlot,
  onUpdateSlot,
  onRemoveSlot,
  saving,
  onSave,
}: AvailabilityPageContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Availability Schedule</h1>
          <p className="text-muted-foreground mt-2">
            Set your weekly working hours with multiple time slots per day. Each slot can be online
            or offline.
          </p>
        </div>
      </div>

      <GoogleCalendarStatus picId={""} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
          <CardDescription>
            Configure your availability for each day of the week. You can add multiple time slots
            per day with different meeting types (online/offline).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {DAYS_OF_WEEK.map(day => (
              <AvailabilityDaySection
                key={day.value}
                day={day}
                slots={availabilities[day.value] ?? []}
                isViewingOwnSchedule={isViewingOwnSchedule}
                onAddSlot={onAddSlot}
                onUpdateSlot={onUpdateSlot}
                onRemoveSlot={onRemoveSlot}
              />
            ))}
          </div>

          {isViewingOwnSchedule && (
            <div className="mt-6 flex justify-end">
              <Button onClick={onSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Schedule"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
