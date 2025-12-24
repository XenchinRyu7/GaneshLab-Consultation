"use client";

import { useState } from "react";

import { AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
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

interface DeleteUserDialogProps {
  userId: string;
  userEmail: string;
  userName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function DeleteUserDialog({
  userId,
  userEmail,
  userName,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Delete API error response:", errorData, "Status:", response.status);
        const errorMessage = errorData.error ?? errorData.message ?? "Failed to delete user";
        setError(errorMessage);
        toast.error("Failed to delete user", {
          description: errorMessage,
        });
        onError?.(errorMessage);
        setLoading(false);
        return;
      }

      toast.success("User deleted successfully", {
        description: `${userName ?? userEmail} has been removed from the system.`,
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      console.error("Delete dialog error:", message);
      setError(message);
      toast.error("Failed to delete user", {
        description: message,
      });
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="text-destructive size-5" />
            Delete User
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <p>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{userName ?? userEmail}</span>? This action cannot
                be undone.
              </p>
              <p className="text-muted-foreground text-xs">
                User email: <code className="bg-muted rounded px-1 py-0.5">{userEmail}</code>
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2">
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 size-4" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
