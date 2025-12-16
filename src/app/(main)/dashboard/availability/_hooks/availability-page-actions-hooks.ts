/**
 * Action hooks for AvailabilityPage
 */

import { useState } from "react";

import { toast } from "sonner";

import {
  type AvailabilityByDay,
  addSlotToAvailability,
  removeSlotFromAvailability,
  updateSlotInAvailability,
} from "./availability-page-hooks";

/**
 * Hook to handle availability slot operations
 */
export function useAvailabilitySlots(
  availabilities: AvailabilityByDay,
  setAvailabilities: (availabilities: AvailabilityByDay) => void
) {
  function addSlot(dayOfWeek: string, date?: string) {
    setAvailabilities(addSlotToAvailability(availabilities, dayOfWeek, date));
  }

  function removeSlot(dayOfWeek: string, index: number) {
    setAvailabilities(removeSlotFromAvailability(availabilities, dayOfWeek, index));
  }

  function updateSlot(
    dayOfWeek: string,
    index: number,
    field: "startTime" | "endTime" | "meetingType",
    value: string
  ) {
    setAvailabilities(updateSlotInAvailability(availabilities, dayOfWeek, index, field, value));
  }

  return { addSlot, removeSlot, updateSlot };
}

/**
 * Hook to handle saving availability
 */
export function useSaveAvailability(
  availabilities: AvailabilityByDay,
  setAvailabilities: (availabilities: AvailabilityByDay) => void,
  weekStart?: Date
) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      const body: { availabilities: AvailabilityByDay; weekStart?: string } = { availabilities };
      if (weekStart) {
        // Use local date components to avoid timezone issues
        const year = weekStart.getFullYear();
        const month = String(weekStart.getMonth() + 1).padStart(2, "0");
        const day = String(weekStart.getDate()).padStart(2, "0");
        body.weekStart = `${year}-${month}-${day}`;
      }

      const response = await fetch("/api/pic/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Failed to save availability");
      }

      const data = await response.json();
      setAvailabilities(data.availabilities);
      toast.success("Availability schedule saved successfully");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save availability schedule");
    } finally {
      setSaving(false);
    }
  }

  return { saving, handleSave };
}
