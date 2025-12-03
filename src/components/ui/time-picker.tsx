"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string; // Format: "HH:mm" (e.g., "09:00", "17:30")
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  id?: string;
}

// Generate hours (00-23)
const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: hour, label: hour };
});

// Generate minutes (00-59, with 15-minute intervals for better UX, or all minutes)
const minutes = Array.from({ length: 60 }, (_, i) => {
  const minute = i.toString().padStart(2, "0");
  return { value: minute, label: minute };
});

export function TimePicker({
  value,
  onChange,
  className,
  disabled,
  id,
}: TimePickerProps) {
  // Parse current value - ensure valid format
  const parseValue = (val: string): [string, string] => {
    if (!val || !val.includes(":")) {
      return ["09", "00"];
    }
    const parts = val.split(":");
    const hour = parts[0]?.padStart(2, "0") || "09";
    const minute = parts[1]?.padStart(2, "0") || "00";

    // Validate hour (00-23) and minute (00-59)
    const validHour = parseInt(hour) >= 0 && parseInt(hour) <= 23 ? hour : "09";
    const validMinute = parseInt(minute) >= 0 && parseInt(minute) <= 59 ? minute : "00";

    return [validHour, validMinute];
  };

  const [hour, minute] = parseValue(value || "09:00");

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hour}:${newMinute}`);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={hour}
        onValueChange={handleHourChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-20" id={id ? `${id}-hour` : undefined}>
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h.value} value={h.value}>
              {h.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground font-medium">:</span>
      <Select
        value={minute}
        onValueChange={handleMinuteChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-20" id={id ? `${id}-minute` : undefined}>
          <SelectValue placeholder="mm" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

