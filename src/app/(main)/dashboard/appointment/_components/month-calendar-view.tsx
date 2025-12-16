"use client";

import { useState, useMemo } from "react";

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import { Clock, Monitor, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [selectedDayForDialog, setSelectedDayForDialog] = useState<Date | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  // Check if slot is in the past

  const isSlotExpired = (slot: PMAvailabilitySlot) => {
    const now = new Date();

    const slotDateTime = new Date(`${slot.date}T${slot.startTime}`);

    return slotDateTime < now;
  };

  const handleDayClick = (day: Date) => {
    setSelectedDayForDialog(day);

    setIsDialogOpen(true);

    onDateSelect?.(day);
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

  // Get appointments and slots for selected day

  const selectedDayStr = selectedDayForDialog ? format(selectedDayForDialog, "yyyy-MM-dd") : null;

  const dialogAppointments = selectedDayStr
    ? appointments.filter(apt => apt.date === selectedDayStr)
    : [];

  const dialogSlots = selectedDayStr
    ? filteredSlots.filter(
        slot => slot.date === selectedDayStr && slot.available && !isSlotExpired(slot)
      )
    : [];

  // Group days by week (7 days per week)

  const weeks: Date[][] = [];

  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="space-y-1 sm:space-y-2">
      <div className="mb-1 grid grid-cols-7 gap-0.5 sm:mb-2 sm:gap-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
          <div
            key={day}
            className="text-muted-foreground p-1 text-center text-[10px] font-medium sm:p-2 sm:text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {weeks.map(week => (
        <div key={format(week[0], "yyyy-MM-dd")} className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {week.map(day => {
            const dayStr = format(day, "yyyy-MM-dd");

            const dayAppointments = appointments.filter(apt => apt.date === dayStr);

            const daySlots = filteredSlots.filter(
              slot => slot.date === dayStr && slot.available && !isSlotExpired(slot)
            );

            const isCurrentMonth = isSameMonth(day, selectedDate);

            const hasConfirmedAppointment = dayAppointments.some(apt => apt.status === "confirmed");

            return (
              <Card
                key={dayStr}
                className={cn(
                  "hover:bg-muted/50 flex min-h-[32px] cursor-pointer items-center justify-center transition-colors sm:min-h-[40px]",

                  !isCurrentMonth && "opacity-40",

                  isToday(day) && "ring-primary ring-1 sm:ring-2"
                )}
                onClick={() => handleDayClick(day)}
              >
                <CardContent className="relative flex flex-col items-center justify-center sm:p-1">
                  <div
                    className={cn(
                      "text-xs leading-none font-medium sm:text-sm",

                      isToday(day) && "text-primary font-bold",

                      !isCurrentMonth && "text-muted-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </div>

                  {isCurrentMonth && (dayAppointments.length > 0 || daySlots.length > 0) && (
                    <div className="mt-0 flex flex-wrap items-center justify-center gap-0.5">
                      {/* Green dot for confirmed appointments */}

                      {hasConfirmedAppointment && (
                        <div
                          className="h-1 w-1 rounded-full bg-green-500"
                          title={`${dayAppointments.filter(apt => apt.status === "confirmed").length} confirmed appointment(s)`}
                        />
                      )}

                      {/* Other appointments - gray dot */}

                      {dayAppointments.filter(apt => apt.status !== "confirmed").length > 0 && (
                        <div
                          className="h-1 w-1 rounded-full bg-gray-400"
                          title={`${dayAppointments.filter(apt => apt.status !== "confirmed").length} other appointment(s)`}
                        />
                      )}

                      {/* Available slots - blue dot */}

                      {daySlots.length > 0 && (
                        <div
                          className="h-1 w-1 rounded-full bg-blue-400"
                          title={`${daySlots.length} available slot(s)`}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}

      {/* Dialog for showing appointments/slots for selected day */}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDayForDialog
                ? format(selectedDayForDialog, "EEEE, MMMM d, yyyy")
                : "Appointments"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {/* Appointments */}

            {dialogAppointments.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Appointments</h3>

                <div className="max-h-[240px] space-y-2 overflow-y-auto sm:max-h-[300px]">
                  {dialogAppointments.map(apt => (
                    <Card
                      key={apt.id}
                      onClick={() => {
                        onAppointmentClick?.(apt);

                        setIsDialogOpen(false);
                      }}
                      className={cn(
                        "cursor-pointer border-2 p-2 transition-opacity hover:opacity-90 sm:p-3",

                        statusColors[apt.status]
                      )}
                    >
                      <div className="space-y-1">
                        <div className="truncate text-xs font-medium sm:text-sm">{apt.title}</div>

                        {apt.description && (
                          <div className="line-clamp-1 text-[10px] opacity-75 sm:text-xs">
                            {apt.description}
                          </div>
                        )}

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

                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          {apt.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Available Slots */}

            {dialogSlots.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Available Slots</h3>

                <div className="max-h-[240px] space-y-2 overflow-y-auto sm:max-h-[300px]">
                  {dialogSlots.map(slot => (
                    <Card
                      key={`${slot.pmId}-${slot.date}-${slot.startTime}-${slot.endTime}`}
                      onClick={() => {
                        onSlotSelect?.(slot);

                        setIsDialogOpen(false);
                      }}
                      className={cn(
                        "cursor-pointer border-2 p-2 transition-opacity hover:opacity-90 sm:p-3",

                        getMeetingTypeColors(slot.type)
                      )}
                    >
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {getMeetingTypeIcon(slot.type)}

                          {getMeetingTypeBadge(slot.type)}
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
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}

            {dialogAppointments.length === 0 && dialogSlots.length === 0 && (
              <div className="text-muted-foreground py-8 text-center text-sm">
                No appointments or available slots for this date
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
