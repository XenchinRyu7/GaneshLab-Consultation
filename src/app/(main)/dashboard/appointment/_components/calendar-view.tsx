"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Appointment, PMAvailabilitySlot, ProjectContext } from "./calendar-config";
import { DayCalendarView } from "./day-calendar-view";
import { MonthCalendarView } from "./month-calendar-view";
import { WeeklyCalendarView } from "./weekly-calendar-view";

interface CalendarViewProps {
  appointments: Appointment[];
  availabilitySlots?: PMAvailabilitySlot[];
  selectedDate?: Date;
  onDateSelect?: (date: Date | undefined) => void;
  onSlotSelect?: (slot: PMAvailabilitySlot) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  projectContext?: ProjectContext;
}

type ViewMode = "day" | "week" | "month";

export function CalendarView({
  appointments,
  availabilitySlots = [],
  selectedDate,
  onDateSelect,
  onSlotSelect,
  onAppointmentClick,
  projectContext,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Appointment Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={value => setViewMode(value as ViewMode)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "day" && (
          <DayCalendarView
            date={selectedDate ?? new Date()}
            appointments={appointments}
            availabilitySlots={availabilitySlots}
            onSlotSelect={onSlotSelect}
            onAppointmentClick={onAppointmentClick}
            projectContext={projectContext}
          />
        )}
        {viewMode === "week" && (
          <WeeklyCalendarView
            selectedDate={selectedDate ?? new Date()}
            appointments={appointments}
            availabilitySlots={availabilitySlots}
            onDateSelect={onDateSelect}
            onSlotSelect={onSlotSelect}
            onAppointmentClick={onAppointmentClick}
            projectContext={projectContext}
          />
        )}
        {viewMode === "month" && (
          <MonthCalendarView
            selectedDate={selectedDate ?? new Date()}
            appointments={appointments}
            availabilitySlots={availabilitySlots}
            onDateSelect={onDateSelect}
            onSlotSelect={onSlotSelect}
            onAppointmentClick={onAppointmentClick}
            projectContext={projectContext}
          />
        )}
      </CardContent>
    </Card>
  );
}
