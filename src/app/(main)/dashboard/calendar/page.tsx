"use client";

import { useState, useEffect, useMemo } from "react";

// TODO: RBAC - temporarily removed, will be in feature/rbac branch
// import { RoleSwitcher } from "@/components/rbac/role-switcher";
// import { PermissionGate } from "@/components/rbac/permission-gate";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
// import { useUserStore } from "@/stores/user/user-provider";

import { CalendarView } from "./_components/calendar-view";
import { CreateAppointmentDialog } from "./_components/create-appointment-dialog";
import { EditAppointmentDialog } from "./_components/edit-appointment-dialog";
import { mockAppointments, generatePMAvailability } from "./_components/calendar-config";
import type { Appointment, PMAvailabilitySlot, ProjectContext } from "./_components/calendar-config";

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  // Fix hydration error: initialize with undefined, set in useEffect
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<PMAvailabilitySlot | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // TODO: RBAC - temporarily removed
  const isClient = true; // Mock for calendar feature

  // Generate PM availability slots (only for clients)
  // Generate untuk 1 bulan penuh (30 hari) dan cache untuk konsistensi
  const allAvailabilitySlots = useMemo(() => {
    if (!isClient) return [];
    // Generate untuk 30 hari ke depan
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    return generatePMAvailability(today, 30);
  }, [isClient]);

  // Filter out slots that are already booked (have appointments)
  const availabilitySlots = useMemo(() => {
    if (!isClient) return [];
    
    // Create a set of booked slots for quick lookup
    const bookedSlots = new Set<string>();
    appointments.forEach((apt) => {
      const slotKey = `${apt.pmId}-${apt.date}-${apt.startTime}-${apt.endTime}`;
      bookedSlots.add(slotKey);
    });

    // Filter out booked slots
    return allAvailabilitySlots.filter((slot) => {
      const slotKey = `${slot.pmId}-${slot.date}-${slot.startTime}-${slot.endTime}`;
      return !bookedSlots.has(slotKey);
    });
  }, [allAvailabilitySlots, appointments, isClient]);

  // Project context - untuk demo, bisa diubah nanti
  // undefined = new project (bisa pilih semua PM)
  // assignedPMId = existing project (hanya PM project tersebut)
  const projectContext: ProjectContext | undefined = useMemo(() => {
    // TODO: Get from actual project data
    // For now, return undefined (new project) for demo
    return undefined;
    // Example for existing project:
    // return {
    //   projectId: "project-1",
    //   projectName: "Existing Project",
    //   assignedPMId: "pm-1",
    // };
  }, []);

  // Set initial date on client side only
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

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

  function handleSaveAppointment(appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">) {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAppointments((prev) => [...prev, newAppointment]);
    setIsCreateDialogOpen(false);
    setSelectedSlot(null);
  }

  function handleUpdateAppointment(appointmentId: string, updates: Partial<Appointment>) {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? { ...apt, ...updates, updatedAt: new Date().toISOString() }
          : apt
      )
    );
    setIsEditDialogOpen(false);
    setEditingAppointment(null);
  }

  function handleDeleteAppointment(appointmentId: string) {
    setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
    setIsEditDialogOpen(false);
    setEditingAppointment(null);
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* TODO: RBAC - RoleSwitcher temporarily removed */}
      {/* <RoleSwitcher /> */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            {isClient
              ? "Search and book appointments with available PMs"
              : "Manage appointments and meetings"}
          </p>
        </div>
        {/* TODO: RBAC - PermissionGate temporarily removed */}
        {/* <PermissionGate permission="appointment.create"> */}
        <Button onClick={handleCreateAppointment} className="gap-2">
          <Plus className="size-4" />
          <span>Create Appointment</span>
        </Button>
        {/* </PermissionGate> */}
      </div>

      <CalendarView
        appointments={appointments}
        availabilitySlots={availabilitySlots}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onSlotSelect={handleSlotSelect}
        onAppointmentClick={handleAppointmentClick}
        projectContext={projectContext}
      />

      {/* Create Appointment Dialog */}
      <CreateAppointmentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleSaveAppointment}
        initialSlot={selectedSlot || undefined}
        projectContext={projectContext}
      />

      {/* Edit Appointment Dialog */}
      <EditAppointmentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        appointment={editingAppointment}
        onUpdate={handleUpdateAppointment}
        onDelete={handleDeleteAppointment}
        projectContext={projectContext}
      />

      {/* TODO: RBAC - PM Availability Section temporarily removed */}
      {/* <PermissionGate permission="pm.availability.manage">
        <div className="mt-4 rounded-lg border p-4">
          <h3 className="font-semibold">PM Availability Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage your working hours and availability (PM only)
          </p>
        </div>
      </PermissionGate> */}
    </div>
  );
}

