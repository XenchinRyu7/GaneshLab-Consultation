"use client";

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
  const { availabilities, loading, setAvailabilities } = useAvailabilities(currentUser?.id ?? null);
  const { addSlot, removeSlot, updateSlot } = useAvailabilitySlots(
    availabilities,
    setAvailabilities
  );
  const { saving, handleSave } = useSaveAvailability(availabilities, setAvailabilities);

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
    <AvailabilityPageContent
      availabilities={availabilities}
      isViewingOwnSchedule={isViewingOwnSchedule}
      onAddSlot={addSlot}
      onUpdateSlot={updateSlot}
      onRemoveSlot={removeSlot}
      saving={saving}
      onSave={handleSave}
    />
  );
}
