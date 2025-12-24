import { Label } from "@/components/ui/label";

interface ClientInfoSectionProps {
  clientName?: string;
  clientEmail?: string;
  projectName?: string;
  // Guest appointment fields
  isGuestAppointment?: boolean;
  guestName?: string;
  guestEmail?: string;
  guestOrganization?: string;
}

export function ClientInfoSection({
  clientName,
  clientEmail,
  projectName,
  isGuestAppointment,
  guestName,
  guestEmail,
  guestOrganization,
}: ClientInfoSectionProps) {
  // For guest appointments, show guest info
  if (isGuestAppointment) {
    if (!guestName) return null;

    return (
      <div className="bg-muted/50 space-y-3 rounded-lg border p-3">
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Guest</Label>
          <p className="font-medium">{guestName}</p>
          {guestEmail && <p className="text-muted-foreground text-sm">{guestEmail}</p>}
          {guestOrganization && (
            <p className="text-muted-foreground text-sm">From: {guestOrganization}</p>
          )}
        </div>
      </div>
    );
  }

  // For regular appointments, show client and project info
  if (!clientName && !projectName) return null;

  return (
    <div className="bg-muted/50 space-y-3 rounded-lg border p-3">
      {clientName && (
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Client</Label>
          <p className="font-medium">{clientName}</p>
          {clientEmail && <p className="text-muted-foreground text-sm">{clientEmail}</p>}
        </div>
      )}

      {projectName && (
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Project</Label>
          <p className="font-medium">{projectName}</p>
        </div>
      )}
    </div>
  );
}
