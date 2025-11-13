"use client";

import { useEffect } from "react";

import { Loader2 } from "lucide-react";

import { AvailabilityPageContent } from "./_components/availability-page-content";
import {
  useAvailabilitySlots,
  useSaveAvailability,
} from "./_hooks/availability-page-actions-hooks";
import {
  useAvailabilityAuthorization,
  useAvailabilities,
  usePICs,
} from "./_hooks/availability-page-data-hooks";

export default function AvailabilityPage() {
  const { currentUser, selectedPicId, setSelectedPicId, isViewingOwnSchedule } =
    useAvailabilityAuthorization();
  const { pics, fetchPICs } = usePICs();
  const { availabilities, loading, viewingPicName, setAvailabilities } =
    useAvailabilities(selectedPicId);
  const { addSlot, removeSlot, updateSlot } = useAvailabilitySlots(
    availabilities,
    setAvailabilities
  );
  const { saving, handleSave } = useSaveAvailability(availabilities, setAvailabilities);

  useEffect(() => {
    if (currentUser) {
      fetchPICs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "pic") {
    return null;
  }

  return (
    <AvailabilityPageContent
      availabilities={availabilities}
      isViewingOwnSchedule={isViewingOwnSchedule}
      viewingPicName={viewingPicName}
      pics={pics}
      selectedPicId={selectedPicId}
      currentUserId={currentUser.id}
      onPicChange={setSelectedPicId}
      onAddSlot={addSlot}
      onUpdateSlot={updateSlot}
      onRemoveSlot={removeSlot}
      saving={saving}
      onSave={handleSave}
    />
  );
}
