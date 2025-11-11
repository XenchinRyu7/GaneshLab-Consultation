"use client";

import { useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Monitor, MapPin, Clock } from "lucide-react";
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

  // Filter availability slots by project context
  const filteredSlots = useMemo(() => {
    if (projectContext?.assignedPMId) {
      return availabilitySlots.filter((slot) => slot.pmId === projectContext.assignedPMId);
    }
    return availabilitySlots;
  }, [availabilitySlots, projectContext]);

  const statusColors = {
    pending: "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-400",
    confirmed: "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400",
    cancelled: "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400",
    completed: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400",
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
        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700 text-xs">
          Online
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700 text-xs">
          Offline
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const dayAppointments = appointments.filter((apt) => apt.date === dayStr);
          const daySlots = filteredSlots.filter((slot) => slot.date === dayStr);

          return (
            <Card key={dayStr} className={cn(
              "min-h-[400px]",
              isToday(day) && "ring-2 ring-primary"
            )}>
              <CardContent className="p-3">
                <div className="text-sm font-medium mb-3 sticky top-0 bg-background z-10 pb-2">
                  {format(day, "EEE")}
                  <div className={cn("text-xs", isToday(day) && "text-primary font-bold")}>
                    {format(day, "d MMM")}
                  </div>
                </div>
                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                  {/* Appointments */}
                  {dayAppointments.map((apt) => (
                    <Card
                      key={apt.id}
                      onClick={() => onAppointmentClick?.(apt)}
                      className={cn(
                        "p-3 cursor-pointer hover:opacity-90 transition-opacity border-2",
                        statusColors[apt.status]
                      )}
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-sm truncate">{apt.title}</div>
                        <div className="flex items-center gap-2 text-xs opacity-75">
                          <Clock className="h-3 w-3" />
                          <span>{apt.startTime} - {apt.endTime}</span>
                        </div>
                        {apt.pmName && (
                          <div className="text-xs opacity-60">PIC: {apt.pmName}</div>
                        )}
                      </div>
                    </Card>
                  ))}
                  {/* Availability Slots - Each slot is a separate card */}
                  {daySlots.map((slot, idx) => (
                    <Card
                      key={`${slot.pmId}-${slot.startTime}-${idx}`}
                      onClick={() => onSlotSelect?.(slot)}
                      className={cn(
                        "p-3 cursor-pointer hover:opacity-90 transition-opacity border-2",
                        getMeetingTypeColors(slot.type)
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getMeetingTypeIcon(slot.type)}
                          {getMeetingTypeBadge(slot.type)}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Clock className="h-3 w-3 opacity-60" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </div>
                        {slot.pmName && (
                          <div className="text-xs opacity-60">PIC: {slot.pmName}</div>
                        )}
                      </div>
                    </Card>
                  ))}
                  {dayAppointments.length === 0 && daySlots.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-8">
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

