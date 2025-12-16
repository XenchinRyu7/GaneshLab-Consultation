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
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-h-[90vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>
            Update appointment details
            {projectContext?.projectName && ` for project "${projectContext.projectName}"`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isClient && (
            <ClientInfoSection
              clientName={appointment.clientName}
              projectName={appointment.projectName}
              isGuestAppointment={appointment.isGuestAppointment}
              guestName={appointment.guestName}
              guestEmail={appointment.guestEmail}
              guestOrganization={appointment.guestOrganization}
            />
          )}

          <AppointmentFormFields {...formState} isClient={isClient} />

          {!isClient && onRequestReschedule && (
            <RescheduleSection onRequestReschedule={handleRescheduleRequest} />
          )}

          {isClient && (
            <div className="space-y-4 border-t pt-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                <h3 className="mb-2 text-lg font-medium text-blue-900 dark:text-blue-100">
                  Need to Reschedule?
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  As a client, you cannot reschedule appointments directly. Please contact your
                  assigned PIC (Person In Charge) to request a reschedule. They will coordinate with
                  you and send a formal reschedule request if needed.
                </p>
              </div>
            </div>
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
