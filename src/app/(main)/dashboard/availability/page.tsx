"use client";

import { useState } from "react";

import { startOfWeek } from "date-fns";
import { Loader2 } from "lucide-react";

import { AvailabilityPageContent } from "./_components/availability-page-content";
import {
  useAvailabilitySlots,
  useSaveAvailability,
} from "./_hooks/availability-page-actions-hooks";
import {
  useAvailabilityAuthorization,
  useAvailabilities,
} from "./_hooks/availability-page-data-hooks";

export default function AvailabilityPage() {
  const { currentUser, isViewingOwnSchedule } = useAvailabilityAuthorization();
  const [selectedWeek, setSelectedWeek] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const { availabilities, loading, setAvailabilities } = useAvailabilities(
    currentUser?.id ?? null,
    selectedWeek
  );
  const { addSlot, removeSlot, updateSlot } = useAvailabilitySlots(
    availabilities,
    setAvailabilities
  );
  const { saving, handleSave } = useSaveAvailability(
    availabilities,
    setAvailabilities,
    selectedWeek
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentUser || (currentUser.role !== "pic" && currentUser.role !== "admin")) {
    return null;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6">
      <AvailabilityPageContent
        availabilities={availabilities}
        isViewingOwnSchedule={isViewingOwnSchedule}
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
        onAddSlot={addSlot}
        onUpdateSlot={updateSlot}
        onRemoveSlot={removeSlot}
        saving={saving}
        onSave={handleSave}
      />
    </div>
  );
}
