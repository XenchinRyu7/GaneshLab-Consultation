"use client";

import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  buildAppointmentPayload,
  calculateDuration,
  fetchAndProcessPICs,
  initializeFormFromSlot,
  validateFormSubmission,
} from "../_hooks/create-appointment-dialog-hooks";

import type {
  Appointment,
  PMAvailabilitySlot,
  MeetingType,
  PIC,
  ProjectContext,
} from "./calendar-config";
import { CreateAppointmentDialogForm } from "./create-appointment-dialog-form";

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => void;
  initialSlot?: PMAvailabilitySlot;
  projectContext?: ProjectContext;
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  onSave,
  initialSlot,
  projectContext,
}: CreateAppointmentDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pmId, setPmId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState<MeetingType>("online");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [pics, setPics] = useState<PIC[]>([]);
  const [loadingPics, setLoadingPics] = useState(false);

  // Fetch PICs
  useEffect(() => {
    fetchAndProcessPICs(projectContext, setPics, setPmId, setLoadingPics);
  }, [projectContext]);

  // Initialize form from initialSlot
  useEffect(() => {
    initializeFormFromSlot(initialSlot, open, {
      setPmId,
      setDate,
      setStartTime,
      setEndTime,
      setType,
      setTitle,
      setDescription,
      setMeetingLink,
      setLocation,
    });
  }, [initialSlot, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { valid, selectedPM } = validateFormSubmission(
      title,
      pmId,
      date,
      startTime,
      endTime,
      pics
    );
    if (!valid || !selectedPM) return;

    const duration = calculateDuration(startTime, endTime);
    const payload = buildAppointmentPayload(
      title,
      description,
      pmId,
      selectedPM,
      date,
      startTime,
      endTime,
      duration,
      type,
      meetingLink,
      location,
      projectContext
    );

    onSave(payload);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Appointment</DialogTitle>
          <DialogDescription>
            Schedule a new appointment with a PIC
            {projectContext?.projectName && ` for project "${projectContext.projectName}"`}
          </DialogDescription>
        </DialogHeader>
        <CreateAppointmentDialogForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          pmId={pmId}
          setPmId={setPmId}
          pics={pics}
          loadingPics={loadingPics}
          projectContext={projectContext}
          date={date}
          setDate={setDate}
          type={type}
          setType={setType}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          meetingLink={meetingLink}
          setMeetingLink={setMeetingLink}
          location={location}
          setLocation={setLocation}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
