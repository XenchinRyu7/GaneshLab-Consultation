"use client";

import { useState, useMemo, useEffect } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parse } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Search, Monitor, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PMAvailabilitySlot, MeetingType, ProjectContext } from "./calendar-config";

interface WeeklyCalendarViewProps {
  availabilitySlots: PMAvailabilitySlot[];
  selectedDate?: Date;
  onSlotSelect?: (slot: PMAvailabilitySlot) => void;
  projectContext?: ProjectContext;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeeklyCalendarView({
  availabilitySlots,
  selectedDate,
  onSlotSelect,
  projectContext,
}: WeeklyCalendarViewProps) {
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<MeetingType | "all">("all");
  const [selectedPM, setSelectedPM] = useState<string>("all");
  const [mounted, setMounted] = useState(false);

  // Fix hydration: set current week after mount
  useEffect(() => {
    setMounted(true);
    if (selectedDate) {
      setCurrentWeek(startOfWeek(selectedDate, { weekStartsOn: 0 }));
    }
  }, [selectedDate]);

  // Get week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  }, [currentWeek]);

  // Filter available PMs based on project context
  const availablePMs = useMemo(() => {
    // Use Map to ensure unique PMs by ID
    const pmMap = new Map<string, { id: string; name: string }>();
    
    availabilitySlots.forEach((slot) => {
      if (!pmMap.has(slot.pmId)) {
        pmMap.set(slot.pmId, { id: slot.pmId, name: slot.pmName });
      }
    });
    
    const allPMs = Array.from(pmMap.values());
    
    // If existing project, only show assigned PM
    if (projectContext?.assignedPMId) {
      return allPMs.filter((pm) => pm.id === projectContext.assignedPMId);
    }
    
    return allPMs;
  }, [availabilitySlots, projectContext]);

  // Filter slots based on search, type, and PM
  const filteredSlots = useMemo(() => {
    let filtered = availabilitySlots.filter((slot) => {
      const slotDate = parse(slot.date, "yyyy-MM-dd", new Date());
      const isInWeek = weekDays.some((day) => isSameDay(day, slotDate));
      if (!isInWeek) return false;

      // Filter by PM
      if (selectedPM !== "all" && slot.pmId !== selectedPM) return false;

      // Filter by type
      if (filterType !== "all" && slot.type !== filterType) return false;

      // Filter by search (PM name)
      if (searchQuery && !slot.pmName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return slot.available;
    });

    return filtered;
  }, [availabilitySlots, weekDays, selectedPM, filterType, searchQuery]);

  // Group slots by date and time
  const slotsByDateAndTime = useMemo(() => {
    const grouped: Record<string, Record<string, PMAvailabilitySlot[]>> = {};

    weekDays.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      grouped[dateStr] = {};

      HOURS.forEach((hour) => {
        const timeStr = `${hour.toString().padStart(2, "0")}:00`;
        grouped[dateStr][timeStr] = [];
      });
    });

    filteredSlots.forEach((slot) => {
      const hour = parseInt(slot.startTime.split(":")[0]);
      const timeKey = `${hour.toString().padStart(2, "0")}:00`;
      
      if (grouped[slot.date] && grouped[slot.date][timeKey]) {
        grouped[slot.date][timeKey].push(slot);
      }
    });

    return grouped;
  }, [filteredSlots, weekDays]);

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleToday = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="size-4" />
          </Button>
          <div className="ml-4 text-lg font-semibold">
            {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search PM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] pl-8"
            />
          </div>
          <Select value={selectedPM} onValueChange={setSelectedPM}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All PMs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PMs</SelectItem>
              {availablePMs.map((pm) => (
                <SelectItem key={pm.id} value={pm.id}>
                  {pm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="online">
                <div className="flex items-center gap-2">
                  <Monitor className="size-4" />
                  Online
                </div>
              </SelectItem>
              <SelectItem value="offline">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  Offline
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header - Days */}
              <div className="grid grid-cols-8 border-b">
                <div className="border-r p-2 text-sm font-medium text-muted-foreground">Time</div>
                {weekDays.map((day, idx) => {
                  const isToday = mounted && selectedDate ? isSameDay(day, selectedDate) : false;
                  return (
                    <div
                      key={`day-${format(day, "yyyy-MM-dd")}`}
                      className={cn(
                        "border-r p-2 text-center",
                        idx === 6 && "border-r-0",
                        isToday && "bg-primary/5"
                      )}
                    >
                      <div className="text-xs text-muted-foreground">{DAYS_OF_WEEK[idx]}</div>
                      <div className="text-sm font-semibold">{format(day, "d")}</div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div className="max-h-[600px] overflow-y-auto">
                {HOURS.map((hour) => {
                  const timeStr = `${hour.toString().padStart(2, "0")}:00`;
                  const displayTime = hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;

                  return (
                    <div key={hour} className="grid grid-cols-8 border-b">
                      <div className="border-r p-2 text-xs text-muted-foreground">{displayTime}</div>
                      {weekDays.map((day, dayIdx) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const slots = slotsByDateAndTime[dateStr]?.[timeStr] || [];

                        return (
                          <div
                            key={dayIdx}
                            className={cn(
                              "border-r min-h-[60px] p-1",
                              dayIdx === 6 && "border-r-0",
                              mounted && selectedDate && isSameDay(day, selectedDate) && "bg-primary/5"
                            )}
                          >
                            {slots.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {slots.map((slot) => (
                                  <button
                                    key={`${slot.pmId}-${slot.date}-${slot.startTime}-${slot.endTime}`}
                                    onClick={() => onSlotSelect?.(slot)}
                                    className={cn(
                                      "w-full rounded px-2 py-1 text-left text-xs transition-colors hover:opacity-80",
                                      slot.type === "online"
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    )}
                                    title={`${slot.pmName} - ${slot.startTime} to ${slot.endTime} (${slot.type})`}
                                  >
                                    <div className="font-medium truncate">{slot.pmName}</div>
                                    <div className="text-[10px] opacity-75">
                                      {slot.startTime} - {slot.endTime}
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      {slot.type === "online" ? (
                                        <Monitor className="size-2.5" />
                                      ) : (
                                        <MapPin className="size-2.5" />
                                      )}
                                      <span className="text-[10px] capitalize">{slot.type}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="h-full w-full" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-blue-100 dark:bg-blue-900/30" />
          <span>Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded bg-green-100 dark:bg-green-900/30" />
          <span>Offline</span>
        </div>
        {projectContext?.assignedPMId && (
          <Badge variant="outline" className="ml-auto">
            Existing Project: {availablePMs[0]?.name || "PM"}
          </Badge>
        )}
        {!projectContext?.assignedPMId && (
          <Badge variant="outline" className="ml-auto">
            New Project: All PMs Available
          </Badge>
        )}
      </div>
    </div>
  );
}

