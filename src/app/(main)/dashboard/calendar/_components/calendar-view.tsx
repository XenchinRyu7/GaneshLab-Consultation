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
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { Appointment, PMAvailabilitySlot, ProjectContext } from "./calendar-config";
import { WeeklyCalendarView } from "./weekly-calendar-view";
import { DayCalendarView } from "./day-calendar-view";
import { MonthCalendarView } from "./month-calendar-view";

interface CalendarViewProps {
  appointments: Appointment[];
  availabilitySlots?: PMAvailabilitySlot[];
  selectedDate?: Date;
  onDateSelect?: (date: Date | undefined) => void;
  onSlotSelect?: (slot: PMAvailabilitySlot) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  projectContext?: ProjectContext;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  completed: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export function CalendarView({
  appointments,
  availabilitySlots = [],
  selectedDate,
  onDateSelect,
  onSlotSelect,
  onAppointmentClick,
  projectContext,
}: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">(
    availabilitySlots.length > 0 ? "week" : "month"
  );

  // Get appointments for selected date
  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const dayAppointments = selectedDateStr
    ? appointments.filter((apt) => apt.date === selectedDateStr)
    : [];


  // Show day view
  if (viewMode === "day" && selectedDate) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-5" />
            <h2 className="text-xl font-semibold">Calendar</h2>
          </div>
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as typeof viewMode)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DayCalendarView
          date={selectedDate}
          availabilitySlots={availabilitySlots}
          appointments={appointments}
          onSlotSelect={onSlotSelect}
          onAppointmentClick={onAppointmentClick}
          projectContext={projectContext}
        />
      </div>
    );
  }

  // Show weekly view if availability slots are provided (for PM selection)
  if (viewMode === "week" && availabilitySlots.length > 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-5" />
            <h2 className="text-xl font-semibold">Calendar</h2>
          </div>
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as typeof viewMode)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <WeeklyCalendarView
          availabilitySlots={availabilitySlots}
          selectedDate={selectedDate}
          onSlotSelect={onSlotSelect}
          projectContext={projectContext}
        />
      </div>
    );
  }

  // Month view - default view
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-5" />
          <h2 className="text-xl font-semibold">Calendar</h2>
        </div>
        <Select value={viewMode} onValueChange={(value) => setViewMode(value as typeof viewMode)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="day">Day</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Month Calendar View - Full Width */}
      <MonthCalendarView
        appointments={appointments}
        availabilitySlots={availabilitySlots}
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        onAppointmentClick={onAppointmentClick}
        onSlotSelect={onSlotSelect}
      />

      {/* Appointments List - Full Width Below Calendar */}
      {selectedDateStr && dayAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  onClick={() => onAppointmentClick?.(appointment)}
                  className="flex flex-col gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base leading-tight">{appointment.title}</h4>
                      {appointment.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {appointment.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs flex-shrink-0", statusColors[appointment.status])}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 flex-shrink-0" />
                      <span>
                        {appointment.startTime} - {appointment.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="capitalize font-medium">{appointment.type}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>with {appointment.pmName}</span>
                    </div>
                    {appointment.location && (
                      <div className="text-xs text-muted-foreground mt-1">
                        📍 {appointment.location}
                      </div>
                    )}
                    {appointment.meetingLink && (
                      <div className="text-xs text-muted-foreground mt-1">
                        🔗 {appointment.meetingLink}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

