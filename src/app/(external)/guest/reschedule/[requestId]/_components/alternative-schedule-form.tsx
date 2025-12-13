"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AlternativeScheduleFormProps {
  alternativeDate: string;
  alternativeStartTime: string;
  alternativeEndTime: string;
  alternativeReason: string;
  submitting: boolean;
  onDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onReasonChange: (reason: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function AlternativeScheduleForm({
  alternativeDate,
  alternativeStartTime,
  alternativeEndTime,
  alternativeReason,
  submitting,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onReasonChange,
  onCancel,
  onSubmit,
}: AlternativeScheduleFormProps) {
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^0-9:]/g, "");
    if (value.length === 2 && !value.includes(":")) {
      value = value + ":";
    }
    if (value.length <= 5) {
      onStartTimeChange(value);
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^0-9:]/g, "");
    if (value.length === 2 && !value.includes(":")) {
      value = value + ":";
    }
    if (value.length <= 5) {
      onEndTimeChange(value);
    }
  };

  const isValid = alternativeDate && alternativeStartTime && alternativeEndTime;

  return (
    <div className="rounded-lg border border-red-700/50 bg-red-950/20 p-6">
      <h3 className="mb-4 text-lg font-semibold text-red-300">
        Propose Alternative Schedule (Optional)
      </h3>
      <p className="mb-4 text-sm text-zinc-400">
        If you cannot attend the proposed time, you can suggest an alternative schedule. Leave blank
        if you just want to reject.
      </p>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">Alternative Date *</label>
          <input
            type="date"
            value={alternativeDate}
            onChange={e => onDateChange(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-zinc-100 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Start Time * (24h format)
            </label>
            <input
              type="text"
              value={alternativeStartTime}
              onChange={handleStartTimeChange}
              placeholder="HH:mm"
              maxLength={5}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              End Time * (24h format)
            </label>
            <input
              type="text"
              value={alternativeEndTime}
              onChange={handleEndTimeChange}
              placeholder="HH:mm"
              maxLength={5}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-300">Reason (Optional)</label>
          <textarea
            value={alternativeReason}
            onChange={e => onReasonChange(e.target.value)}
            placeholder="Explain why you need this alternative schedule..."
            rows={3}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-transparent focus:ring-2 focus:ring-zinc-500"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={submitting || !isValid}
            variant="destructive"
            className="flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Reject & Submit Alternative"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
