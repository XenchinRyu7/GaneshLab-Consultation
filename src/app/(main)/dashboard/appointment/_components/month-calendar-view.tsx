"use client";

import { useMemo } from "react";

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import { Monitor, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { Appointment, PMAvailabilitySlot, ProjectContext } from "./calendar-config";

interface MonthCalendarViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  availabilitySlots?: PMAvailabilitySlot[];
  onDateSelect?: (date: Date) => void;
  onSlotSelect?: (slot: PMAvailabilitySlot) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  projectContext?: ProjectContext;
}

export function MonthCalendarView({
  selectedDate,
  appointments,
  availabilitySlots = [],
  onDateSelect,
  onSlotSelect,
  onAppointmentClick,
  projectContext,
}: MonthCalendarViewProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  // Get first day of week for the month start (Monday = 0)
  const firstDayOfWeek = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;

  // Get last day of week for the month end
  const lastDayOfWeek = monthEnd.getDay() === 0 ? 6 : monthEnd.getDay() - 1;

  // Calculate calendar start (first Monday of the calendar view)
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - firstDayOfWeek);

  // Calculate calendar end (last Sunday of the calendar view)
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(calendarEnd.getDate() + (6 - lastDayOfWeek));

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Filter availability slots by project context
  const filteredSlots = useMemo(() => {
    if (projectContext?.assignedPMId) {
      return availabilitySlots.filter(slot => slot.pmId === projectContext.assignedPMId);
    }
    return availabilitySlots;
  }, [availabilitySlots, projectContext]);

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

  // Group days by week (7 days per week)
  const weeks: Date[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="space-y-2">
      <div className="mb-2 grid grid-cols-7 gap-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
          <div key={day} className="text-muted-foreground p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-1">
          {week.map(day => {
            const dayStr = format(day, "yyyy-MM-dd");
            const dayAppointments = appointments.filter(apt => apt.date === dayStr);
            const daySlots = filteredSlots.filter(slot => slot.date === dayStr);
            const isCurrentMonth = isSameMonth(day, selectedDate);

            return (
              <Card
                key={dayStr}
                className={cn(
                  "hover:bg-muted/50 min-h-[120px] cursor-pointer transition-colors",
                  !isCurrentMonth && "opacity-40",
                  isToday(day) && "ring-primary ring-2"
                )}
                onClick={() => onDateSelect?.(day)}
              >
                <CardContent className="p-2">
                  <div
                    className={cn(
                      "bg-background sticky top-0 z-10 mb-2 text-sm font-medium",
                      isToday(day) && "text-primary font-bold",
                      !isCurrentMonth && "text-muted-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="max-h-[90px] space-y-1.5 overflow-y-auto">
                    {isCurrentMonth && (
                      <>
                        {/* Appointments - Each as a small card */}
                        {dayAppointments.slice(0, 3).map(apt => (
                          <Card
                            key={apt.id}
                            onClick={e => {
                              e.stopPropagation();
                              onAppointmentClick?.(apt);
                            }}
                            className={cn(
                              "cursor-pointer border p-1.5 text-xs transition-opacity hover:opacity-90",
                              statusColors[apt.status]
                            )}
                            title={apt.title}
                          >
                            <div className="truncate font-medium">
                              {apt.startTime} {apt.title}
                            </div>
                          </Card>
                        ))}
                        {dayAppointments.length > 3 && (
                          <div className="text-muted-foreground text-center text-xs">
                            +{dayAppointments.length - 3} more
                          </div>
                        )}
                        {/* Availability Slots - Each as a small card */}
                        {daySlots.slice(0, 3 - dayAppointments.length).map((slot, idx) => (
                          <Card
                            key={`${slot.pmId}-${slot.startTime}-${idx}`}
                            onClick={e => {
                              e.stopPropagation();
                              onSlotSelect?.(slot);
                            }}
                            className={cn(
                              "cursor-pointer border p-1.5 text-xs transition-opacity hover:opacity-90",
                              getMeetingTypeColors(slot.type)
                            )}
                          >
                            <div className="flex items-center gap-1">
                              {slot.type === "online" ? (
                                <Monitor className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <MapPin className="h-2.5 w-2.5 text-orange-600 dark:text-orange-400" />
                              )}
                              <span className="truncate">{slot.startTime}</span>
                              {getMeetingTypeBadge(slot.type)}
                            </div>
                          </Card>
                        ))}
                        {daySlots.length > 3 - dayAppointments.length &&
                          dayAppointments.length < 3 && (
                            <div className="text-muted-foreground text-center text-xs">
                              +{daySlots.length - (3 - dayAppointments.length)} more slots
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
