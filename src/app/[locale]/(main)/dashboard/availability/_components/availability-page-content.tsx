/**
 * Main content component for AvailabilityPage
 */

import { format, addDays, addWeeks, subWeeks, startOfWeek } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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
  selectedWeek: Date;
  onWeekChange: (week: Date) => void;
  onAddSlot: (dayOfWeek: string, date?: string) => void;
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
  selectedWeek,
  onWeekChange,
  onAddSlot,
  onUpdateSlot,
  onRemoveSlot,
  saving,
  onSave,
}: AvailabilityPageContentProps) {
  const weekStart = selectedWeek;
  const weekEnd = addDays(weekStart, 6);

  const handlePreviousWeek = () => {
    onWeekChange(subWeeks(selectedWeek, 1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(selectedWeek, 1));
  };

  const handleToday = () => {
    onWeekChange(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Map day values to day index (Monday = 0)
  const dayIndexMap: Record<string, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Availability Schedule</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Set your weekly working hours with multiple time slots per day. Each slot can be online or
          offline.
        </p>
      </div>

      <GoogleCalendarStatus picId={""} />

      <Card className="w-full overflow-hidden">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                Weekly Schedule
              </CardTitle>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                Configure your availability for each day of the week. You can add multiple time
                slots per day with different meeting types (online/offline).
              </CardDescription>
            </div>
          </div>
          {/* Week Navigation */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-2 sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousWeek}
                className="flex-1 sm:min-w-[auto] sm:flex-initial"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous Week</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="flex-1 sm:flex-initial"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextWeek}
                className="flex-1 sm:min-w-[auto] sm:flex-initial"
              >
                <span className="hidden sm:inline">Next Week</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full overflow-x-hidden">
          <div className="space-y-4 sm:space-y-6">
            {DAYS_OF_WEEK.map(day => {
              const dayIndex = dayIndexMap[day.value];
              const dayDate = addDays(weekStart, dayIndex);

              // Calculate date string using local date components to match user's calendar view
              // This ensures consistency with how dates are displayed in the UI
              const year = dayDate.getFullYear();
              const month = String(dayDate.getMonth() + 1).padStart(2, "0");
              const dateDay = String(dayDate.getDate()).padStart(2, "0");
              const dayDateStr = `${year}-${month}-${dateDay}`;

              // Filter slots by the specific date in the selected week
              const daySlots = (availabilities[day.value] ?? []).filter(slot => {
                // If slot has a date field, filter by it; otherwise show all slots for this day of week
                if (slot.date) {
                  return slot.date === dayDateStr;
                }
                // For backward compatibility, if no date field, show all slots for this day of week
                return true;
              });

              return (
                <AvailabilityDaySection
                  key={day.value}
                  day={day}
                  dayDate={dayDate}
                  slots={daySlots}
                  isViewingOwnSchedule={isViewingOwnSchedule}
                  onAddSlot={() => onAddSlot(day.value, dayDateStr)}
                  onUpdateSlot={onUpdateSlot}
                  onRemoveSlot={onRemoveSlot}
                />
              );
            })}
          </div>

          {isViewingOwnSchedule && (
            <div className="mt-6 flex justify-end">
              <Button onClick={onSave} disabled={saving} className="w-full sm:w-auto">
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
