"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GuestAppointment = {
  id: string;
  title: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestOrganization?: string;
  guestPurpose: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  picId?: string;
  pic?: {
    fullname: string;
  };
  createdAt: string;
};

interface DeleteAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: GuestAppointment | null;
  onDelete: () => void;
  isProcessing: boolean;
}

export function DeleteAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onDelete,
  isProcessing,
}: DeleteAppointmentDialogProps) {
  const handleDelete = () => {
    onDelete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this guest appointment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="text-sm">
            <strong>Appointment:</strong> {appointment?.title}
            <br />
            <strong>Guest:</strong> {appointment?.guestName}
            <br />
            <strong>Date:</strong>{" "}
            {appointment ? new Date(appointment.date).toLocaleDateString() : ""}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>
            {isProcessing ? "Deleting..." : "Delete Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
