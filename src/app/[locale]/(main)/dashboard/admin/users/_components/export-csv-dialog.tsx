"use client";

import { Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

interface ExportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userCount: number;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ExportCSVDialog({
  open,
  onOpenChange,
  userCount,
  onConfirm,
  isLoading = false,
}: ExportCSVDialogProps) {
  const handleConfirm = () => {
    try {
      onConfirm();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to export CSV", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Download className="size-5" />
            Export Users to CSV
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                You are about to export <span className="font-semibold">{userCount}</span> user
                record(s) to CSV format.
              </p>
              <div className="bg-muted space-y-1 rounded-md p-3">
                <p className="text-muted-foreground text-xs font-medium">Exported fields:</p>
                <ul className="text-muted-foreground list-inside list-disc space-y-1 text-xs">
                  <li>Email</li>
                  <li>Full Name</li>
                  <li>Role</li>
                  <li>Phone</li>
                  <li>Created Date</li>
                </ul>
              </div>
              <div className="flex items-start gap-2 rounded-md bg-yellow-50 p-2 dark:bg-yellow-950/20">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-yellow-600 dark:text-yellow-600" />
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  Sensitive data (passwords, user IDs) are excluded for security.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2 size-4" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 size-4" />
                Export
              </>
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
