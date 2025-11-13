"use client";

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

import { useAppointmentHandlers } from "./_components/appointment-page-handlers";
import { AppointmentPageHeader } from "./_components/appointment-page-header";
import { CalendarView } from "./_components/calendar-view";
import { CreateAppointmentDialog } from "./_components/create-appointment-dialog";
import { EditAppointmentDialog } from "./_components/edit-appointment-dialog";
import { useAppointmentPage } from "./_hooks/appointment-page-hooks";

export default function AppointmentPage() {
  const {
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
  } = useAppointmentPage();

  const currentUser = useUserStore(state => state.currentUser);

  const {
    handleCreateAppointment,
    handleSlotSelect,
    handleAppointmentClick,
    handleSaveAppointment,
    handleUpdateAppointment,
    handleDeleteAppointment,
    confirmDeleteAppointment,
  } = useAppointmentHandlers({
    currentUserId: currentUser?.id,
    activeProjectId: activeProject?.id,
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
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <AppointmentPageHeader
        isClient={isClient}
        activeProjectName={activeProject?.name ?? null}
        onCreateAppointment={handleCreateAppointment}
      />

      {!activeProject && isClient && (
        <div className="bg-muted/50 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">
            <strong>Note:</strong> No active project selected. You can book appointments with any
            available PIC. Select a project from the sidebar to filter appointments by project PIC.
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
            <AlertDialogAction
              onClick={confirmDeleteAppointment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isClient && (
        <CreateAppointmentDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSave={handleSaveAppointment}
          initialSlot={selectedSlot ?? undefined}
          projectContext={projectContext}
        />
      )}

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
