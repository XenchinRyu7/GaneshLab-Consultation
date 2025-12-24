"use client";

import { useMemo } from "react";

import { format, startOfWeek, addDays, isToday, addWeeks, subWeeks } from "date-fns";
import { Monitor, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { Appointment, PMAvailabilitySlot, ProjectContext } from "./calendar-config";

interface WeeklyCalendarViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  availabilitySlots?: PMAvailabilitySlot[];
  onDateSelect?: (date: Date) => void;
  onSlotSelect?: (slot: PMAvailabilitySlot) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  projectContext?: ProjectContext;
}

export function WeeklyCalendarView({
  selectedDate,
  appointments,
  availabilitySlots = [],
  onDateSelect,
  onSlotSelect,
  onAppointmentClick,
  projectContext,
}: WeeklyCalendarViewProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePreviousWeek = () => {
    const newDate = subWeeks(selectedDate, 1);
    onDateSelect?.(newDate);
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(selectedDate, 1);
    onDateSelect?.(newDate);
  };

  const handleToday = () => {
    onDateSelect?.(new Date());
  };

  // Filter availability slots by project context
  const filteredSlots = useMemo(() => {
    if (projectContext?.assignedPMId) {
      return availabilitySlots.filter(slot => slot.pmId === projectContext.assignedPMId);
    }
    return availabilitySlots;
  }, [availabilitySlots, projectContext]);

  // Check if slot is in the past
  const isSlotExpired = (slot: PMAvailabilitySlot) => {
    const now = new Date();
    const slotDateTime = new Date(`${slot.date}T${slot.startTime}`);
    return slotDateTime < now;
  };

  const statusColors = {
    pending:
      "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-400",
    confirmed:
      "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400",
    cancelled:
      "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400",
    completed:
      "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400",
  };

  // Get color classes for meeting types (availability slots)
  const getMeetingTypeColors = (type: "online" | "offline") => {
    if (type === "online") {
      return "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800";
    } else {
      return "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800";
    }
  };

  const getMeetingTypeIcon = (type: "online" | "offline") => {
    if (type === "online") {
      return <Monitor className="h-3 w-3 text-blue-600 dark:text-blue-400" />;
    } else {
      return <MapPin className="h-3 w-3 text-orange-600 dark:text-orange-400" />;
    }
  };

  const getMeetingTypeBadge = (type: "online" | "offline") => {
    if (type === "online") {
      return (
        <Badge
          variant="outline"
          className="border-blue-300 bg-blue-100 text-[10px] text-blue-700 sm:text-xs dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
        >
          Online
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="border-orange-300 bg-orange-100 text-[10px] text-orange-700 sm:text-xs dark:border-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
        >
          Offline
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousWeek}
            className="sm:min-w-[auto]"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Previous Week</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek} className="sm:min-w-[auto]">
            <span className="hidden sm:inline">Next Week</span>
            <ChevronRight className="h-4 w-4 sm:ml-1" />
          </Button>
        </div>
        <div className="text-center sm:text-left">
          <span className="text-muted-foreground text-xs font-medium sm:text-sm">
            {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
        </div>
      </div>

      {/* Week Grid */}
      <div className="overflow-x-auto">
        <div className="grid min-w-[700px] grid-cols-7 gap-2 sm:min-w-0">
          {weekDays.map(day => {
            const dayStr = format(day, "yyyy-MM-dd");
            const dayAppointments = appointments.filter(apt => apt.date === dayStr);
            const daySlots = filteredSlots.filter(slot => slot.date === dayStr);

            return (
              <Card
                key={dayStr}
                className={cn(
                  "min-h-[300px] sm:min-h-[400px]",
                  isToday(day) && "ring-primary ring-2"
                )}
              >
                <CardContent className="p-2 sm:p-3">
                  <div className="bg-background sticky top-0 z-10 mb-2 pb-2 text-xs font-medium sm:mb-3 sm:text-sm">
                    {format(day, "EEE")}
                    <div
                      className={cn(
                        "text-[10px] sm:text-xs",
                        isToday(day) && "text-primary font-bold"
                      )}
                    >
                      {format(day, "d MMM")}
                    </div>
                  </div>
                  <div className="max-h-[240px] space-y-1.5 overflow-y-auto sm:max-h-[280px] sm:space-y-2">
                    {/* Appointments */}
                    {dayAppointments.map(apt => (
                      <Card
                        key={apt.id}
                        onClick={() => onAppointmentClick?.(apt)}
                        className={cn(
                          "cursor-pointer border-2 p-2 transition-opacity hover:opacity-90 sm:p-3",
                          statusColors[apt.status]
                        )}
                      >
                        <div className="space-y-1">
                          <div className="truncate text-xs font-medium sm:text-sm">{apt.title}</div>
                          <div className="flex items-center gap-1.5 text-[10px] opacity-75 sm:gap-2 sm:text-xs">
                            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span>
                              {apt.startTime} - {apt.endTime}
                            </span>
                          </div>
                          {apt.picName && (
                            <div className="text-[10px] opacity-60 sm:text-xs">
                              PIC: {apt.picName}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                    {/* Availability Slots - Each slot is a separate card */}
                    {daySlots.map((slot, idx) => {
                      const expired = isSlotExpired(slot);
                      const canSelect = slot.available && !expired;
                      return (
                        <Card
                          key={`${slot.pmId}-${slot.startTime}-${idx}`}
                          onClick={() => canSelect && onSlotSelect?.(slot)}
                          className={cn(
                            "border-2 p-2 transition-opacity sm:p-3",
                            canSelect
                              ? "cursor-pointer hover:opacity-90"
                              : "cursor-not-allowed opacity-50",
                            getMeetingTypeColors(slot.type)
                          )}
                        >
                          <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              {getMeetingTypeIcon(slot.type)}
                              {getMeetingTypeBadge(slot.type)}
                              {!slot.available && (
                                <Badge variant="destructive" className="text-[10px] sm:text-xs">
                                  Booked
                                </Badge>
                              )}
                              {expired && (
                                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                  Expired
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-medium sm:gap-2 sm:text-xs">
                              <Clock className="h-2.5 w-2.5 opacity-60 sm:h-3 sm:w-3" />
                              <span>
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            {slot.pmName && (
                              <div className="text-[10px] opacity-60 sm:text-xs">
                                PIC: {slot.pmName}
                              </div>
                            )}
                            {!canSelect && (
                              <div className="text-muted-foreground text-[10px] sm:text-xs">
                                {expired
                                  ? "This slot has already passed"
                                  : "This slot is no longer available"}
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                    {dayAppointments.length === 0 && daySlots.length === 0 && (
                      <div className="text-muted-foreground py-6 text-center text-[10px] sm:py-8 sm:text-xs">
                        No appointments or available slots
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
