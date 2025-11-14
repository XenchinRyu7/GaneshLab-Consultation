import { useState, useEffect, useMemo } from "react";

import { useProjectStore } from "@/stores/project/project-provider";
import { useUserStore } from "@/stores/user/user-provider";

import type {
  Appointment,
  PMAvailabilitySlot,
  ProjectContext,
} from "../_components/calendar-config";

export function useAppointmentPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<PMAvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<PMAvailabilitySlot | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

  const currentUser = useUserStore(state => state.currentUser);
  const activeProject = useProjectStore(state => state.activeProject);
  const isClient = currentUser?.role === "client";

  const projectContext: ProjectContext | undefined = useMemo(() => {
    if (!activeProject) {
      return undefined;
    }

    return {
      projectId: activeProject.id,
      projectName: activeProject.name,
      assignedPMId: activeProject.picId,
    };
  }, [activeProject]);

  async function fetchAppointments() {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userId = currentUser.id;
      const role = currentUser.role;

      const response = await fetch(`/api/appointments?userId=${userId}&role=${role}`);
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      setAppointments(data.appointments ?? []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailability() {
    if (!currentUser || !isClient) return;

    try {
      const picId = activeProject?.picId;
      const params = new URLSearchParams();
      if (picId) {
        params.append("picId", picId);
      }
      const startDate = new Date().toISOString().split("T")[0];
      params.append("startDate", startDate);
      params.append("days", "30");

      const response = await fetch(`/api/appointments/availability?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }

      const data = await response.json();
      setAvailabilitySlots(data.slots ?? []);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchAppointments();
      if (isClient) {
        fetchAvailability();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, activeProject, isClient]);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  return {
    appointments,
    availabilitySlots,
    loading,
    selectedDate,
    selectedSlot,
    isCreateDialogOpen,
    isEditDialogOpen,
    editingAppointment,
    deleteDialogOpen,
    appointmentToDelete,
    projectContext,
    isClient,
    activeProject,
    setAppointments,
    setSelectedDate,
    setSelectedSlot,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setEditingAppointment,
    setDeleteDialogOpen,
    setAppointmentToDelete,
    fetchAppointments,
    fetchAvailability,
  };
}
