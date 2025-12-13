"use client";

import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  submitting: boolean;
  showAlternativeForm: boolean;
  onApprove: () => void;
  onReject: () => void;
  onShowAlternativeForm: () => void;
}

export function ActionButtons({
  submitting,
  showAlternativeForm,
  onApprove,
  onReject,
  onShowAlternativeForm,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      <Button
        onClick={onApprove}
        disabled={submitting}
        className="flex-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 sm:flex-initial"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve
          </>
        )}
      </Button>
      <Button
        onClick={showAlternativeForm ? onReject : onShowAlternativeForm}
        disabled={submitting}
        variant="destructive"
        className="flex-1 sm:flex-initial"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <XCircle className="mr-2 h-4 w-4" />
            {showAlternativeForm ? "Reject & Submit Alternative" : "Reject (Requires Alternative)"}
          </>
        )}
      </Button>
    </div>
  );
}
