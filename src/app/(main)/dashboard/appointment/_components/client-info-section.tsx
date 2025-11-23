import { Label } from "@/components/ui/label";

interface ClientInfoSectionProps {
  clientName?: string;
  clientEmail?: string;
}

export function ClientInfoSection({ clientName, clientEmail }: ClientInfoSectionProps) {
  if (!clientName) return null;

  return (
    <div className="bg-muted/50 space-y-1 rounded-lg border p-3">
      <Label className="text-muted-foreground text-xs">Client</Label>
      <p className="font-medium">{clientName}</p>
      {clientEmail && <p className="text-muted-foreground text-sm">{clientEmail}</p>}
    </div>
  );
}
