"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type PIC = {
  id: string;
  fullname: string;
  email: string;
};

interface AssignPICDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: GuestAppointment | null;
  pics: PIC[];
  onAssign: (picId: string) => void;
  onFetchPICs: (date: string, startTime: string, endTime: string) => void;
  isAssigning: boolean;
}

export function AssignPICDialog({
  open,
  onOpenChange,
  appointment,
  pics,
  onAssign,
  onFetchPICs,
  isAssigning,
}: AssignPICDialogProps) {
  const [selectedPicId, setSelectedPicId] = useState<string>("");

  useEffect(() => {
    if (open && appointment) {
      onFetchPICs(appointment.date, appointment.startTime, appointment.endTime);
    }
  }, [open, appointment, onFetchPICs]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (newOpen) {
      setSelectedPicId("");
    }
  };

  const handleAssign = () => {
    if (selectedPicId) {
      onAssign(selectedPicId);
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign & Approve Appointment</DialogTitle>
          <DialogDescription>
            Assign a PIC to handle this guest appointment. The appointment will be automatically
            approved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Appointment</label>
            <p className="text-muted-foreground text-sm">
              {appointment?.title} - {appointment?.guestName}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Available PICs</label>
            <Select value={selectedPicId} onValueChange={setSelectedPicId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a PIC" />
              </SelectTrigger>
              <SelectContent>
                {pics.map(pic => (
                  <SelectItem key={pic.id} value={pic.id}>
                    {pic.fullname} ({pic.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAssigning}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedPicId || isAssigning}>
            {isAssigning ? "Assigning & Approving..." : "Assign & Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
