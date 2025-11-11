"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUserStore } from "@/stores/user/user-provider";
import { useProjectStore } from "@/stores/project/project-provider";

import { CalendarView } from "./_components/calendar-view";
import { CreateAppointmentDialog } from "./_components/create-appointment-dialog";
import { EditAppointmentDialog } from "./_components/edit-appointment-dialog";
import type { Appointment, PMAvailabilitySlot, ProjectContext } from "./_components/calendar-config";

export default function AppointmentPage() {
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

  const currentUser = useUserStore((state) => state.currentUser);
  const activeProject = useProjectStore((state) => state.activeProject);
  const isClient = currentUser?.role === "client";

  // Project context - berdasarkan project aktif
  const projectContext: ProjectContext | undefined = useMemo(() => {
    if (!activeProject) {
      // No active project - user can select any PIC
      return undefined;
    }

    // Active project exists - only show PIC assigned to this project
    return {
      projectId: activeProject.id,
      projectName: activeProject.name,
      assignedPMId: activeProject.picId,
    };
  }, [activeProject]);

  // Fetch appointments and availability
  useEffect(() => {
    if (currentUser) {
      fetchAppointments();
      if (isClient) {
        fetchAvailability();
      }
    }
  }, [currentUser, activeProject, isClient]);

  // Set initial date on client side only
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

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
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailability() {
    if (!currentUser || !isClient) return;

    try {
      // Filter by active project's PIC if project exists
      const picId = activeProject?.picId;
      const params = new URLSearchParams();
      if (picId) {
        params.append("picId", picId);
      }
      // Fetch availability for next 30 days (1 month)
      const startDate = new Date().toISOString().split("T")[0];
      params.append("startDate", startDate);
      params.append("days", "30");

      const response = await fetch(`/api/appointments/availability?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }

      const data = await response.json();
      setAvailabilitySlots(data.slots || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  }

  function handleCreateAppointment() {
    setSelectedSlot(null);
    setIsCreateDialogOpen(true);
  }

  function handleSlotSelect(slot: PMAvailabilitySlot) {
    setSelectedSlot(slot);
    setIsCreateDialogOpen(true);
  }

  function handleAppointmentClick(appointment: Appointment) {
    setEditingAppointment(appointment);
    setIsEditDialogOpen(true);
  }

  async function handleSaveAppointment(appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">) {
    if (!currentUser) return;

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: appointmentData.title,
          description: appointmentData.description,
          clientId: currentUser.id,
          picId: appointmentData.pmId,
          projectId: appointmentData.projectId || activeProject?.id || null,
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
        throw new Error(error.error || "Failed to create appointment");
      }

      const data = await response.json();
      setAppointments((prev) => [...prev, data.appointment]);
      setIsCreateDialogOpen(false);
      setSelectedSlot(null);
      
      // Refresh appointments and availability
      await fetchAppointments();
      if (isClient) {
        await fetchAvailability();
      }
      toast.success("Appointment created successfully");
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast.error(error.message || "Failed to create appointment");
    }
  }

  async function handleUpdateAppointment(appointmentId: string, updates: Partial<Appointment>) {
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
        throw new Error(error.error || "Failed to update appointment");
      }

      const data = await response.json();
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? data.appointment : apt))
      );
      setIsEditDialogOpen(false);
      setEditingAppointment(null);
      
      // Refresh appointments and availability
      await fetchAppointments();
      if (isClient) {
        await fetchAvailability();
      }
      toast.success("Appointment updated successfully");
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      toast.error(error.message || "Failed to update appointment");
    }
  }

  function handleDeleteAppointment(appointmentId: string) {
    setAppointmentToDelete(appointmentId);
    setDeleteDialogOpen(true);
  }

  async function confirmDeleteAppointment() {
    if (!appointmentToDelete) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error deleting appointment:", error);
        throw new Error(error.error || "Failed to delete appointment");
      }

      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentToDelete));
      setIsEditDialogOpen(false);
      setEditingAppointment(null);
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
      
      // Refresh appointments and availability
      await fetchAppointments();
      if (isClient) {
        await fetchAvailability();
      }
      toast.success("Appointment cancelled successfully");
    } catch (error: any) {
      console.error("Error deleting appointment:", error);
      toast.error(error.message || "Failed to cancel appointment");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointment</h1>
          <p className="text-muted-foreground">
            {isClient
              ? activeProject
                ? `Schedule meetings with your PIC for project "${activeProject.name}" (available for 1 week or 1 month ahead)`
                : "Search and book appointments with available PICs (1 week or 1 month ahead)"
              : "Manage appointments and meetings"}
          </p>
        </div>
        {isClient && (
          <Button onClick={handleCreateAppointment} className="gap-2">
            <Plus className="size-4" />
            <span>Create Appointment</span>
          </Button>
        )}
      </div>

      {!activeProject && isClient && (
        <div className="rounded-lg border p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> No active project selected. You can book appointments with any available PIC.
            Select a project from the sidebar to filter appointments by project PIC.
          </p>
        </div>
      )}

      <CalendarView
        appointments={appointments}
        availabilitySlots={availabilitySlots}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onSlotSelect={handleSlotSelect}
        onAppointmentClick={handleAppointmentClick}
        projectContext={projectContext}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAppointment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Appointment Dialog */}
      {isClient && (
        <CreateAppointmentDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSave={handleSaveAppointment}
          initialSlot={selectedSlot || undefined}
          projectContext={projectContext}
        />
      )}

      {/* Edit Appointment Dialog */}
      <EditAppointmentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        appointment={editingAppointment}
        onUpdate={handleUpdateAppointment}
        onDelete={handleDeleteAppointment}
        projectContext={projectContext}
      />
    </div>
  );
}

