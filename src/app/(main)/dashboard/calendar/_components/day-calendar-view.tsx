"use client";

import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Monitor, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PMAvailabilitySlot, Appointment, MeetingType, ProjectContext } from "./calendar-config";

interface DayCalendarViewProps {
  date: Date;
  availabilitySlots?: PMAvailabilitySlot[];
  appointments?: Appointment[];
  onSlotSelect?: (slot: PMAvailabilitySlot) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  projectContext?: ProjectContext;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

export function DayCalendarView({
  date,
  availabilitySlots = [],
  appointments = [],
  onSlotSelect,
  onAppointmentClick,
  projectContext,
}: DayCalendarViewProps) {
  const dateStr = format(date, "yyyy-MM-dd");

  // Filter slots and appointments for this day
  const daySlots = useMemo(() => {
    return availabilitySlots.filter((slot) => slot.date === dateStr && slot.available);
  }, [availabilitySlots, dateStr]);

  const dayAppointments = useMemo(() => {
    return appointments.filter((apt) => apt.date === dateStr);
  }, [appointments, dateStr]);

  // Group slots by hour
  const slotsByHour = useMemo(() => {
    const grouped: Record<number, PMAvailabilitySlot[]> = {};
    daySlots.forEach((slot) => {
      const hour = parseInt(slot.startTime.split(":")[0]);
      if (!grouped[hour]) grouped[hour] = [];
      grouped[hour].push(slot);
    });
    return grouped;
  }, [daySlots]);

  // Group appointments by hour
  const appointmentsByHour = useMemo(() => {
    const grouped: Record<number, Appointment[]> = {};
    dayAppointments.forEach((apt) => {
      const hour = parseInt(apt.startTime.split(":")[0]);
      if (!grouped[hour]) grouped[hour] = [];
      grouped[hour].push(apt);
    });
    return grouped;
  }, [dayAppointments]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{format(date, "EEEE, MMMM d, yyyy")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[700px] overflow-y-auto">
            {HOURS.map((hour) => {
              const displayTime = hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
              const slots = slotsByHour[hour] || [];
              const apts = appointmentsByHour[hour] || [];

              return (
                <div key={hour} className="grid grid-cols-12 border-b last:border-b-0">
                  <div className="col-span-1 border-r p-3 text-sm font-medium text-muted-foreground">
                    {displayTime}
                  </div>
                  <div className="col-span-11 p-2">
                    <div className="flex flex-col gap-2">
                      {/* Appointments */}
                      {apts.map((apt) => (
                        <div
                          key={apt.id}
                          onClick={() => onAppointmentClick?.(apt)}
                          className={cn(
                            "rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                            apt.status === "confirmed" && "bg-green-50 dark:bg-green-900/10",
                            apt.status === "pending" && "bg-yellow-50 dark:bg-yellow-900/10",
                            apt.status === "cancelled" && "bg-red-50 dark:bg-red-900/10",
                            apt.status === "completed" && "bg-gray-50 dark:bg-gray-900/10"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{apt.title}</h4>
                              {apt.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {apt.description}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {apt.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="size-3" />
                              <span>
                                {apt.startTime} - {apt.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {apt.type === "online" ? (
                                <Monitor className="size-3" />
                              ) : (
                                <MapPin className="size-3" />
                              )}
                              <span className="capitalize">{apt.type}</span>
                            </div>
                            <span>with {apt.pmName}</span>
                          </div>
                        </div>
                      ))}

                      {/* Available Slots */}
                      {slots.map((slot) => (
                        <button
                          key={`${slot.pmId}-${slot.startTime}-${slot.endTime}`}
                          onClick={() => onSlotSelect?.(slot)}
                          className={cn(
                            "rounded-lg border p-2 text-left text-xs transition-colors hover:opacity-80",
                            slot.type === "online"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          )}
                        >
                          <div className="font-medium">{slot.pmName}</div>
                          <div className="mt-1 opacity-75">
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {slot.type === "online" ? (
                              <Monitor className="size-2.5" />
                            ) : (
                              <MapPin className="size-2.5" />
                            )}
                            <span className="capitalize">{slot.type}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

