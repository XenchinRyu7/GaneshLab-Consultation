"use client";

import { useState, useMemo, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Monitor, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment, PMAvailabilitySlot } from "./calendar-config";
import { DayDetailDialog } from "./day-detail-dialog";

interface MonthCalendarViewProps {
  appointments: Appointment[];
  availabilitySlots?: PMAvailabilitySlot[];
  selectedDate?: Date;
  onDateSelect?: (date: Date | undefined) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  onSlotSelect?: (slot: PMAvailabilitySlot) => void;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendarView({
  appointments,
  availabilitySlots = [],
  selectedDate,
  onDateSelect,
  onAppointmentClick,
  onSlotSelect,
}: MonthCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = selectedDate || new Date();
    return startOfMonth(date);
  });
  const [mounted, setMounted] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailDate, setDetailDate] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    if (selectedDate) {
      setCurrentMonth(startOfMonth(selectedDate));
    }
  }, [selectedDate]);

  // Get all days in the month view (including previous/next month days)
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach((apt) => {
      if (!grouped[apt.date]) {
        grouped[apt.date] = [];
      }
      grouped[apt.date].push(apt);
    });
    return grouped;
  }, [appointments]);

  // Group availability slots by date (for client view)
  const availabilityByDate = useMemo(() => {
    const grouped: Record<string, PMAvailabilitySlot[]> = {};
    availabilitySlots.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  }, [availabilitySlots]);

  function handlePreviousMonth() {
    setCurrentMonth(subMonths(currentMonth, 1));
  }

  function handleNextMonth() {
    setCurrentMonth(addMonths(currentMonth, 1));
  }

  function handleToday() {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    onDateSelect?.(today);
  }

  function handleDateClick(date: Date) {
    onDateSelect?.(date);
    // Open detail dialog
    setDetailDate(date);
    setDetailDialogOpen(true);
  }

  if (!mounted) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-[600px] flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading calendar...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="h-8 px-3"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="border-r last:border-r-0 p-3 text-center text-sm font-semibold text-muted-foreground bg-muted/50"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {monthDays.map((day, idx) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayAppointments = appointmentsByDate[dateStr] || [];
              const dayAvailability = availabilityByDate[dateStr] || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = mounted && selectedDate ? isSameDay(day, selectedDate) : false;
              const isToday = mounted ? isSameDay(day, new Date()) : false;

              return (
                <div
                  key={`${dateStr}-${idx}`}
                  className={cn(
                    "border-r border-b last:border-r-0 min-h-[120px] p-2 transition-colors",
                    !isCurrentMonth && "bg-muted/30",
                    isSelected && "bg-primary/10 ring-2 ring-primary",
                    isToday && !isSelected && "bg-primary/5",
                    "hover:bg-muted/50 cursor-pointer"
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="flex flex-col h-full">
                    {/* Date Number */}
                    <div
                      className={cn(
                        "text-sm font-semibold mb-2",
                        !isCurrentMonth && "text-muted-foreground",
                        isToday && "text-primary font-bold",
                        isSelected && "text-primary"
                      )}
                    >
                      {format(day, "d")}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                      {/* Appointments (Booked) */}
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick?.(apt);
                          }}
                          className={cn(
                            "text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                            apt.status === "confirmed" &&
                              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                            apt.status === "pending" &&
                              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                            apt.status === "cancelled" &&
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                            apt.status === "completed" &&
                              "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                          )}
                          title={`${apt.title} - ${apt.startTime}`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="size-2.5 flex-shrink-0" />
                            <span className="truncate">{apt.startTime}</span>
                          </div>
                          <div className="truncate font-medium">{apt.title}</div>
                        </div>
                      ))}

                      {/* Availability Slots (Available - for clients) */}
                      {dayAvailability.length > 0 && dayAppointments.length < 2 && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            // Show first available slot or allow clicking to see all
                            if (dayAvailability[0] && onSlotSelect) {
                              onSlotSelect(dayAvailability[0]);
                            }
                          }}
                          className={cn(
                            "text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                            dayAvailability[0]?.type === "online"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          )}
                          title={`${dayAvailability.length} available slot(s)`}
                        >
                          <div className="flex items-center gap-1">
                            {dayAvailability[0]?.type === "online" ? (
                              <Monitor className="size-2.5 flex-shrink-0" />
                            ) : (
                              <MapPin className="size-2.5 flex-shrink-0" />
                            )}
                            <span className="truncate">{dayAvailability[0]?.startTime}</span>
                          </div>
                          <div className="truncate font-medium">
                            {dayAvailability.length === 1
                              ? `${dayAvailability[0]?.pmName}`
                              : `${dayAvailability.length} slots`}
                          </div>
                        </div>
                      )}

                      {/* More indicator */}
                      {(dayAppointments.length > 2 || dayAvailability.length > 1) && (
                        <div className="text-xs text-muted-foreground px-2">
                          {dayAppointments.length > 2 && `+${dayAppointments.length - 2} apt`}
                          {dayAppointments.length > 2 && dayAvailability.length > 1 && " • "}
                          {dayAvailability.length > 1 && `+${dayAvailability.length - 1} slots`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <DayDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        date={detailDate}
        appointments={appointments}
        availabilitySlots={availabilitySlots}
        onAppointmentClick={onAppointmentClick}
        onSlotSelect={onSlotSelect}
      />
    </div>
  );
}

