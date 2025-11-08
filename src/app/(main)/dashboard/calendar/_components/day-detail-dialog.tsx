"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Monitor, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment, PMAvailabilitySlot } from "./calendar-config";

interface DayDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  appointments: Appointment[];
  availabilitySlots?: PMAvailabilitySlot[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onSlotSelect?: (slot: PMAvailabilitySlot) => void;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  completed: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export function DayDetailDialog({
  open,
  onOpenChange,
  date,
  appointments,
  availabilitySlots = [],
  onAppointmentClick,
  onSlotSelect,
}: DayDetailDialogProps) {
  if (!date) return null;

  const dateStr = format(date, "yyyy-MM-dd");
  const dayAppointments = appointments.filter((apt) => apt.date === dateStr);
  const dayAvailability = availabilitySlots.filter((slot) => slot.date === dateStr);

  // Sort appointments by time
  const sortedAppointments = [...dayAppointments].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  // Sort availability slots by time
  const sortedAvailability = [...dayAvailability].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="size-5" />
            {format(date, "EEEE, MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription>
            {dayAppointments.length} appointment(s) • {dayAvailability.length} available slot(s)
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-4">
          {/* Appointments Section */}
          {sortedAppointments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Appointments</h3>
              <div className="grid gap-3">
                {sortedAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => {
                      onAppointmentClick?.(apt);
                      onOpenChange(false);
                    }}
                    className="flex flex-col gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base leading-tight">{apt.title}</h4>
                        {apt.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {apt.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-xs flex-shrink-0", statusColors[apt.status])}
                      >
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 flex-shrink-0" />
                        <span>
                          {apt.startTime} - {apt.endTime}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span>{apt.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {apt.type === "online" ? (
                          <Monitor className="size-4 flex-shrink-0" />
                        ) : (
                          <MapPin className="size-4 flex-shrink-0" />
                        )}
                        <span className="capitalize font-medium">{apt.type}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>with {apt.pmName}</span>
                      </div>
                      {apt.location && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="size-3" />
                          <span>{apt.location}</span>
                        </div>
                      )}
                      {apt.meetingLink && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Monitor className="size-3" />
                          <a
                            href={apt.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {apt.meetingLink}
                          </a>
                        </div>
                      )}
                      {apt.notes && (
                        <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                          <strong>Notes:</strong> {apt.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability Slots Section */}
          {sortedAvailability.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Available Slots</h3>
              <div className="grid gap-3">
                {sortedAvailability.map((slot, idx) => (
                  <div
                    key={`${slot.pmId}-${slot.startTime}-${slot.endTime}-${idx}`}
                    onClick={() => {
                      onSlotSelect?.(slot);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "flex items-center justify-between gap-4 rounded-lg border p-4 hover:opacity-80 transition-opacity cursor-pointer",
                      slot.type === "online"
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                        : "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-base">{slot.pmName}</h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            slot.type === "online"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          )}
                        >
                          {slot.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {slot.type === "online" ? (
                        <Monitor className="size-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <MapPin className="size-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {sortedAppointments.length === 0 && sortedAvailability.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarIcon className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No appointments or available slots for this date</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

