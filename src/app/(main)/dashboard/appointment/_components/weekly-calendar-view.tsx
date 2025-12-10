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

  // Filter available and future slots for selection
  const selectableSlots = useMemo(() => {
    return filteredSlots.filter(slot => slot.available && !isSlotExpired(slot));
  }, [filteredSlots]);

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
          className="border-blue-300 bg-blue-100 text-xs text-blue-700 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
        >
          Online
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="border-orange-300 bg-orange-100 text-xs text-orange-700 dark:border-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
        >
          Offline
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous Week
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <span className="text-muted-foreground text-sm font-medium">
            {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleNextWeek}>
          Next Week
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dayStr = format(day, "yyyy-MM-dd");
          const dayAppointments = appointments.filter(apt => apt.date === dayStr);
          const daySlots = filteredSlots.filter(slot => slot.date === dayStr);

          return (
            <Card
              key={dayStr}
              className={cn("min-h-[400px]", isToday(day) && "ring-primary ring-2")}
            >
              <CardContent className="p-3">
                <div className="bg-background sticky top-0 z-10 mb-3 pb-2 text-sm font-medium">
                  {format(day, "EEE")}
                  <div className={cn("text-xs", isToday(day) && "text-primary font-bold")}>
                    {format(day, "d MMM")}
                  </div>
                </div>
                <div className="max-h-[350px] space-y-2 overflow-y-auto">
                  {/* Appointments */}
                  {dayAppointments.map(apt => (
                    <Card
                      key={apt.id}
                      onClick={() => onAppointmentClick?.(apt)}
                      className={cn(
                        "cursor-pointer border-2 p-3 transition-opacity hover:opacity-90",
                        statusColors[apt.status]
                      )}
                    >
                      <div className="space-y-1">
                        <div className="truncate text-sm font-medium">{apt.title}</div>
                        <div className="flex items-center gap-2 text-xs opacity-75">
                          <Clock className="h-3 w-3" />
                          <span>
                            {apt.startTime} - {apt.endTime}
                          </span>
                        </div>
                        {apt.picName && (
                          <div className="text-xs opacity-60">PIC: {apt.picName}</div>
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
                          "border-2 p-3 transition-opacity",
                          canSelect
                            ? "cursor-pointer hover:opacity-90"
                            : "cursor-not-allowed opacity-50",
                          getMeetingTypeColors(slot.type)
                        )}
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {getMeetingTypeIcon(slot.type)}
                            {getMeetingTypeBadge(slot.type)}
                            {!slot.available && (
                              <Badge variant="destructive" className="text-xs">
                                Booked
                              </Badge>
                            )}
                            {expired && (
                              <Badge variant="secondary" className="text-xs">
                                Expired
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <Clock className="h-3 w-3 opacity-60" />
                            <span>
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          {slot.pmName && (
                            <div className="text-xs opacity-60">PIC: {slot.pmName}</div>
                          )}
                          {!canSelect && (
                            <div className="text-muted-foreground text-xs">
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
                    <div className="text-muted-foreground py-8 text-center text-xs">
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
  );
}
