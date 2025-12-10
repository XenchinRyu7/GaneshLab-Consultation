"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

interface RejectAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: GuestAppointment | null;
  onReject: (reason: string) => void;
  isProcessing: boolean;
}

export function RejectAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onReject,
  isProcessing,
}: RejectAppointmentDialogProps) {
  const [reason, setReason] = useState("");

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (newOpen) {
      setReason("");
    }
  };

  const handleReject = () => {
    if (reason.trim()) {
      onReject(reason);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Appointment</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this guest appointment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Appointment</Label>
            <p className="text-muted-foreground text-sm">
              {appointment?.title} - {appointment?.guestName}
            </p>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Rejection *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this appointment..."
              rows={3}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!reason.trim() || isProcessing}
          >
            {isProcessing ? "Rejecting..." : "Reject Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
