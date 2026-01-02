"use client";

import { useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { AssignPICDialog } from "./_components/assign-pic-dialog";
import { DeleteAppointmentDialog } from "./_components/delete-appointment-dialog";
import { getGuestAppointmentColumns } from "./_components/guest-appointment-columns";
import { RejectAppointmentDialog } from "./_components/reject-appointment-dialog";
import { useGuestAppointmentActions } from "./_hooks/use-guest-appointment-actions";
import { useGuestAppointments } from "./_hooks/use-guest-appointments";

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

export default function GuestAppointmentsPage() {
  const { appointments, pics, loading, fetchGuestAppointments, fetchAvailablePICs } =
    useGuestAppointments();

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<GuestAppointment | null>(null);

  const {
    isAssigning,
    isProcessing,
    handleAssignPIC,
    handleRejectAppointment,
    handleDeleteAppointment,
  } = useGuestAppointmentActions(selectedAppointment, () => {
    fetchGuestAppointments();
    setSelectedAppointment(null);
  });

  const handleAssign = (appointment: GuestAppointment) => {
    setSelectedAppointment(appointment);
    setAssignDialogOpen(true);
  };

  const handleReject = (appointment: GuestAppointment) => {
    setSelectedAppointment(appointment);
    setRejectDialogOpen(true);
  };

  const handleDelete = (appointment: GuestAppointment) => {
    setSelectedAppointment(appointment);
    setDeleteDialogOpen(true);
  };

  const columns = getGuestAppointmentColumns(handleAssign, handleReject, handleDelete);

  const table = useDataTableInstance({
    data: appointments,
    columns,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Guest Appointments</h1>
        <p className="text-muted-foreground">Manage guest appointment requests and assignments.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p>Loading guest appointments...</p>
          </div>
        </div>
      ) : (
        <DataTable table={table} columns={columns} />
      )}

      <AssignPICDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        appointment={selectedAppointment}
        pics={pics}
        onAssign={picId => handleAssignPIC(picId)}
        onFetchPICs={fetchAvailablePICs}
        isAssigning={isAssigning}
      />

      <RejectAppointmentDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        appointment={selectedAppointment}
        onReject={handleRejectAppointment}
        isProcessing={isProcessing}
      />

      <DeleteAppointmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        appointment={selectedAppointment}
        onDelete={handleDeleteAppointment}
        isProcessing={isProcessing}
      />
    </div>
  );
}
