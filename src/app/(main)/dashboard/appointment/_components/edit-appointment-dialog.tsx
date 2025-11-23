"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { AppointmentFormFields } from "./appointment-form-fields";
import type { Appointment, ProjectContext } from "./calendar-config";
import { ClientInfoSection } from "./client-info-section";
import { RescheduleSection } from "./reschedule-section";
import { useAppointmentForm } from "./use-appointment-form";

interface EditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onUpdate: (appointmentId: string, updates: Partial<Appointment>) => void;
  onDelete: (appointmentId: string) => void;
  onRequestReschedule?: (
    appointmentId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ) => void;
  projectContext?: ProjectContext;
  isClient?: boolean;
}

export function EditAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onUpdate,
  onDelete,
  onRequestReschedule,
  projectContext,
  isClient = false,
}: EditAppointmentDialogProps) {
  const formState = useAppointmentForm({ appointment });

  function validateForm(): boolean {
    return !!(
      appointment &&
      formState.title.trim() &&
      formState.date &&
      formState.startTime &&
      formState.endTime
    );
  }

  function buildUpdatePayload() {
    if (isClient) {
      return {
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        notes: formState.notes.trim() || undefined,
      };
    }
    return {
      status: formState.status,
      notes: formState.notes.trim() || undefined,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm() || !appointment) return;

    onUpdate(appointment.id, buildUpdatePayload());
    onOpenChange(false);
  }

  function handleDelete() {
    if (!appointment) return;
    onDelete(appointment.id);
    onOpenChange(false);
  }

  function handleRescheduleRequest(newDate: string, newStartTime: string, newEndTime: string) {
    if (!appointment || !onRequestReschedule) return;
    onRequestReschedule(appointment.id, newDate, newStartTime, newEndTime);
    onOpenChange(false);
  }

  if (!appointment) return null;

  const isFormValid = formState.title && formState.date && formState.startTime && formState.endTime;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={appointment.id}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>
            Update appointment details
            {projectContext?.projectName && ` for project "${projectContext.projectName}"`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isClient && appointment.clientName && (
            <ClientInfoSection clientName={appointment.clientName} />
          )}

          <AppointmentFormFields {...formState} isClient={isClient} />

          {!isClient && onRequestReschedule && (
            <RescheduleSection onRequestReschedule={handleRescheduleRequest} />
          )}

          <DialogFooter className="flex items-center justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isFormValid}>
                Update Appointment
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
