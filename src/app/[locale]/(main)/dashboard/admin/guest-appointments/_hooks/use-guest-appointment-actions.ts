"use client";

import { useState } from "react";

import { toast } from "sonner";

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

export function useGuestAppointmentActions(
  selectedAppointment: GuestAppointment | null,
  onSuccess: () => void
) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleAssignPIC(picId: string) {
    if (!selectedAppointment || !picId) return;

    setIsAssigning(true);
    try {
      const response = await fetch(
        `/api/admin/guest-appointments/${selectedAppointment.id}/assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ picId }),
        }
      );

      if (!response.ok) throw new Error("Failed to assign PIC");

      toast.success("PIC berhasil ditugaskan");
      onSuccess();
    } catch {
      toast.error("Gagal menugaskan PIC");
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleApproveAppointment() {
    if (!selectedAppointment) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/admin/guest-appointments/${selectedAppointment.id}/approve`,
        {
          method: "POST",
        }
      );

      if (!response.ok) throw new Error("Failed to approve");

      toast.success("Appointment berhasil diapprove");
      onSuccess();
    } catch {
      toast.error("Gagal approve appointment");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRejectAppointment(reason: string) {
    if (!selectedAppointment) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/admin/guest-appointments/${selectedAppointment.id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject");

      toast.success("Appointment berhasil direject");
      onSuccess();
    } catch {
      toast.error("Gagal reject appointment");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDeleteAppointment() {
    if (!selectedAppointment) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/guest-appointments/${selectedAppointment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Appointment berhasil dihapus");
      onSuccess();
    } catch {
      toast.error("Gagal menghapus appointment");
    } finally {
      setIsProcessing(false);
    }
  }

  return {
    isAssigning,
    isProcessing,
    handleAssignPIC,
    handleApproveAppointment,
    handleRejectAppointment,
    handleDeleteAppointment,
  };
}
