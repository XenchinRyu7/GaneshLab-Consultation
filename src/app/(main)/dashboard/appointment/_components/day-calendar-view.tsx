"use client";

import { useMemo } from "react";

import { format, isToday } from "date-fns";
import { Monitor, MapPin, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { Appointment, PMAvailabilitySlot, ProjectContext } from "./calendar-config";

interface DayCalendarViewProps {
  date: Date;
  appointments: Appointment[];
  availabilitySlots?: PMAvailabilitySlot[];
  onSlotSelect?: (slot: PMAvailabilitySlot) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  projectContext?: ProjectContext;
}

export function DayCalendarView({
  date,
  appointments,
  availabilitySlots = [],
  onSlotSelect,
  onAppointmentClick,
  projectContext,
}: DayCalendarViewProps) {
  const dateStr = format(date, "yyyy-MM-dd");

  // Filter by date
  const dayAppointments = useMemo(() => {
    return appointments.filter(apt => apt.date === dateStr);
  }, [appointments, dateStr]);

  // Filter availability slots
  const daySlots = useMemo(() => {
    let slots = availabilitySlots.filter(slot => slot.date === dateStr);
    if (projectContext?.assignedPMId) {
      slots = slots.filter(slot => slot.pmId === projectContext.assignedPMId);
    }
    return slots;
  }, [availabilitySlots, dateStr, projectContext]);

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
      return <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    } else {
      return <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    }
  };

  const getMeetingTypeBadge = (type: "online" | "offline") => {
    if (type === "online") {
      return (
        <Badge
          variant="outline"
          className="border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
        >
          Online
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
        >
          Offline
        </Badge>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {format(date, "EEEE, MMMM d, yyyy")}
          {isToday(date) && <Badge className="ml-2">Today</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Appointments */}
          {dayAppointments.map(apt => (
            <Card
              key={apt.id}
              onClick={() => onAppointmentClick?.(apt)}
              className={cn(
                "cursor-pointer border-2 p-4 transition-opacity hover:opacity-90",
                statusColors[apt.status]
              )}
            >
              <div className="space-y-2">
                <div className="font-medium">{apt.title}</div>
                <div className="flex items-center gap-2 text-sm opacity-75">
                  <Clock className="h-4 w-4" />
                  <span>
                    {apt.startTime} - {apt.endTime}
                  </span>
                </div>
                {apt.picName && <div className="text-sm opacity-60">PIC: {apt.picName}</div>}
                {apt.description && (
                  <div className="mt-1 text-sm opacity-60">{apt.description}</div>
                )}
              </div>
            </Card>
          ))}

          {/* Availability Slots - Each slot is a separate card */}
          {daySlots.map(slot => (
            <Card
              key={`${slot.pmId}-${slot.startTime}-${slot.endTime}`}
              onClick={() => onSlotSelect?.(slot)}
              className={cn(
                "cursor-pointer border-2 p-4 transition-opacity hover:opacity-90",
                getMeetingTypeColors(slot.type)
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getMeetingTypeIcon(slot.type)}
                  {getMeetingTypeBadge(slot.type)}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 opacity-60" />
                  <span>
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
                {slot.pmName && <div className="text-sm opacity-60">PIC: {slot.pmName}</div>}
              </div>
            </Card>
          ))}

          {dayAppointments.length === 0 && daySlots.length === 0 && (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No appointments or available slots for this day
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
