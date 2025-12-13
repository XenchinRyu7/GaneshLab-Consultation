import { Label } from "@/components/ui/label";

interface ClientInfoSectionProps {
  clientName?: string;
  clientEmail?: string;
  projectName?: string;
}

export function ClientInfoSection({
  clientName,
  clientEmail,
  projectName,
}: ClientInfoSectionProps) {
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
