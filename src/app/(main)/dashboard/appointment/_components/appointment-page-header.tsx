import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AppointmentPageHeaderProps {
  isClient: boolean;
  activeProjectName: string | null;
  onCreateAppointment?: () => void;
}

export function AppointmentPageHeader({
  isClient,
  activeProjectName,
  onCreateAppointment,
}: AppointmentPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Appointment</h1>
        <p className="text-muted-foreground">
          {isClient
            ? activeProjectName
              ? `Schedule meetings with your PIC for project "${activeProjectName}" (available for 1 week or 1 month ahead)`
              : "Search and book appointments with available PICs (1 week or 1 month ahead)"
            : "Manage appointments and meetings"}
        </p>
      </div>
      {isClient && onCreateAppointment && (
        <Button onClick={onCreateAppointment} className="gap-2">
          <Plus className="size-4" />
          <span>Create Appointment</span>
        </Button>
      )}
    </div>
  );
}
