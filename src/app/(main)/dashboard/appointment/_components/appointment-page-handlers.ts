import { toast } from "sonner";

import type { Appointment, PMAvailabilitySlot } from "./calendar-config";

interface UseAppointmentHandlersProps {
  currentUserId: string | undefined;
  activeProjectId: string | undefined;
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  setIsCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedSlot: React.Dispatch<React.SetStateAction<PMAvailabilitySlot | null>>;
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingAppointment: React.Dispatch<React.SetStateAction<Appointment | null>>;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setAppointmentToDelete: React.Dispatch<React.SetStateAction<string | null>>;
  fetchAppointments: () => Promise<void>;
  fetchAvailability: () => Promise<void>;
  isClient: boolean;
  appointmentToDelete: string | null;
}

export function useAppointmentHandlers({
  currentUserId,
  activeProjectId,
  setAppointments,
  setIsCreateDialogOpen,
  setSelectedSlot,
  setIsEditDialogOpen,
  setEditingAppointment,
  setDeleteDialogOpen,
  setAppointmentToDelete,
  fetchAppointments,
  fetchAvailability,
  isClient,
  appointmentToDelete,
}: UseAppointmentHandlersProps) {
  const handleCreateAppointment = () => {
    setSelectedSlot(null);
    setIsCreateDialogOpen(true);
  };

  const handleSlotSelect = (slot: PMAvailabilitySlot) => {
    setSelectedSlot(slot);
    setIsCreateDialogOpen(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsEditDialogOpen(true);
  };

  const handleSaveAppointment = async (
    appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!currentUserId) return;

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: appointmentData.title,
          description: appointmentData.description,
          clientId: currentUserId,
          picId: appointmentData.pmId,
          projectId: appointmentData.projectId ?? activeProjectId ?? null,
          date: appointmentData.date,
          startTime: appointmentData.startTime,
          endTime: appointmentData.endTime,
          duration: appointmentData.duration,
          type: appointmentData.type,
          meetingLink: appointmentData.meetingLink,
          location: appointmentData.location,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Failed to create appointment");
      }

      const data = await response.json();
      setAppointments(prev => [...prev, data.appointment]);
      setIsCreateDialogOpen(false);
      setSelectedSlot(null);

      await fetchAppointments();
      if (isClient) {
        await fetchAvailability();
      }
      toast.success("Appointment created successfully");
    } catch (error: unknown) {
      console.error("Error creating appointment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create appointment");
    }
  };

  const handleUpdateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: updates.title,
          description: updates.description,
          date: updates.date,
          startTime: updates.startTime,
          endTime: updates.endTime,
          duration: updates.duration,
          type: updates.type,
          status: updates.status,
          meetingLink: updates.meetingLink,
          location: updates.location,
          notes: updates.notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Failed to update appointment");
      }

      const data = await response.json();
      setAppointments(prev => prev.map(apt => (apt.id === appointmentId ? data.appointment : apt)));
      setIsEditDialogOpen(false);
      setEditingAppointment(null);

      await fetchAppointments();
      if (isClient) {
        await fetchAvailability();
      }
      toast.success("Appointment updated successfully");
    } catch (error: unknown) {
      console.error("Error updating appointment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update appointment");
    }
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error deleting appointment:", error);
        throw new Error(error.error ?? "Failed to delete appointment");
      }

      setAppointments(prev => prev.filter(apt => apt.id !== appointmentToDelete));
      setIsEditDialogOpen(false);
      setEditingAppointment(null);
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);

      await fetchAppointments();
      if (isClient) {
        await fetchAvailability();
      }
      toast.success("Appointment cancelled successfully");
    } catch (error: unknown) {
      console.error("Error deleting appointment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel appointment");
    }
  };

  return {
    handleCreateAppointment,
    handleSlotSelect,
    handleAppointmentClick,
    handleSaveAppointment,
    handleUpdateAppointment,
    handleDeleteAppointment,
    confirmDeleteAppointment,
  };
}
