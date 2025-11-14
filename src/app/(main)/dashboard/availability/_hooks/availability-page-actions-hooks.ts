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
  function addSlot(dayOfWeek: string) {
    setAvailabilities(addSlotToAvailability(availabilities, dayOfWeek));
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
  setAvailabilities: (availabilities: AvailabilityByDay) => void
) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      const response = await fetch("/api/pic/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availabilities }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Failed to save availability");
      }

      const data = await response.json();
      setAvailabilities(data.availabilities);
      toast.success("Availability schedule saved successfully");
    } catch (error: unknown) {
      console.error("Error saving availability:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save availability schedule");
    } finally {
      setSaving(false);
    }
  }

  return { saving, handleSave };
}
