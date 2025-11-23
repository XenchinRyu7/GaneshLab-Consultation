import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";

interface RescheduleSectionProps {
  onRequestReschedule: (newDate: string, newStartTime: string, newEndTime: string) => void;
}

export function RescheduleSection({ onRequestReschedule }: RescheduleSectionProps) {
  const [showRescheduleRequest, setShowRescheduleRequest] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStartTime, setRescheduleStartTime] = useState("");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  const handleRequestReschedule = () => {
    if (!rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) return;

    onRequestReschedule(rescheduleDate, rescheduleStartTime, rescheduleEndTime);
    setShowRescheduleRequest(false);
  };

  const isRescheduleFormValid = rescheduleDate && rescheduleStartTime && rescheduleEndTime;

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Reschedule Request</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowRescheduleRequest(!showRescheduleRequest)}
        >
          {showRescheduleRequest ? "Cancel" : "Request Reschedule"}
        </Button>
      </div>

      {showRescheduleRequest && (
        <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rescheduleDate">New Date *</Label>
              <Input
                id="rescheduleDate"
                type="date"
                value={rescheduleDate}
                onChange={e => setRescheduleDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>New Start Time *</Label>
              <TimePicker
                value={rescheduleStartTime}
                onChange={setRescheduleStartTime}
                id="rescheduleStartTime"
              />
            </div>

            <div className="space-y-2">
              <Label>New End Time *</Label>
              <TimePicker
                value={rescheduleEndTime}
                onChange={setRescheduleEndTime}
                id="rescheduleEndTime"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rescheduleReason">Reason for Reschedule</Label>
            <Textarea
              id="rescheduleReason"
              value={rescheduleReason}
              onChange={e => setRescheduleReason(e.target.value)}
              placeholder="Please explain why you need to reschedule this appointment"
              rows={3}
            />
          </div>

          <Button
            type="button"
            onClick={handleRequestReschedule}
            disabled={!isRescheduleFormValid}
            className="w-full"
          >
            Send Reschedule Request
          </Button>
        </div>
      )}
    </div>
  );
}
