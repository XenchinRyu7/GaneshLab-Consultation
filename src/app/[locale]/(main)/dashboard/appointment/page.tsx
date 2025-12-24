"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { RescheduleRequests } from "./_components/reschedule-requests";
import { useAppointmentPage } from "./_hooks/appointment-page-hooks";

export default function AppointmentPage() {
  const t = useTranslations("Appointments");
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
    isPIC,
    activeProject,
    pics,
    selectedPicId,
    setAppointments,
    setSelectedDate,
    setSelectedSlot,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setEditingAppointment,
    setDeleteDialogOpen,
    setAppointmentToDelete,
    setSelectedPicId,
    fetchAppointments,
    fetchAvailability,
  } = useAppointmentPage();

  const currentUser = useUserStore(state => state.currentUser);

  const canCreateAppointment =
    !activeProject || activeProject.status === "APPROVED" || activeProject.status === "ACTIVE";

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingAppointment(null);
    }
  };

  const {
    handleCreateAppointment,
    handleSlotSelect,
    handleAppointmentClick,
    handleSaveAppointment,
    handleUpdateAppointment,
    handleDeleteAppointment,
    confirmDeleteAppointment,
    handleRequestReschedule,
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
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <AppointmentPageHeader
        isClient={isClient}
        isPIC={isPIC}
        activeProjectName={activeProject?.name ?? null}
        pics={pics}
        selectedPicId={selectedPicId}
        currentUserId={currentUser?.id}
        onPicChange={setSelectedPicId}
        onCreateAppointment={canCreateAppointment ? handleCreateAppointment : undefined}
      />

      {isClient && currentUser?.id && <RescheduleRequests clientId={currentUser.id} />}

      {activeProject && !canCreateAppointment && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("projectNotApproved")}</AlertTitle>
          <AlertDescription>
            {t("projectNotApprovedDescription")} <strong>{activeProject.status}</strong>.{" "}
            {t("projectNotApprovedDescription2")}
          </AlertDescription>
        </Alert>
      )}

      {!activeProject && isClient && (
        <div className="bg-muted/50 rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">{t("noActiveProjectNote")}</p>
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
            <AlertDialogTitle>{t("cancelAppointment")}</AlertDialogTitle>
            <AlertDialogDescription>{t("cancelAppointmentConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("keepAppointment")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAppointment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("cancelAppointmentAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isClient && canCreateAppointment && (
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
        onOpenChange={handleEditDialogOpenChange}
        appointment={editingAppointment}
        onUpdate={handleUpdateAppointment}
        onDelete={handleDeleteAppointment}
        onRequestReschedule={handleRequestReschedule}
        projectContext={projectContext}
        isClient={isClient}
      />
    </div>
  );
}
