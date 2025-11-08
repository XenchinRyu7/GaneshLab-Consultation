"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor, MapPin } from "lucide-react";
import type { Appointment, MeetingType, AppointmentStatus } from "./calendar-config";
import { mockPMs } from "./calendar-config";

interface EditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onUpdate: (appointmentId: string, updates: Partial<Appointment>) => void;
  onDelete?: (appointmentId: string) => void;
  projectContext?: { assignedPMId?: string };
}

export function EditAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onUpdate,
  onDelete,
  projectContext,
}: EditAppointmentDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pmId, setPmId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState<MeetingType>("online");
  const [status, setStatus] = useState<AppointmentStatus>("pending");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Available PMs based on project context
  const availablePMs = projectContext?.assignedPMId
    ? mockPMs.filter((pm) => pm.id === projectContext.assignedPMId)
    : mockPMs;

  // Initialize form from appointment
  useEffect(() => {
    if (appointment && open) {
      setTitle(appointment.title);
      setDescription(appointment.description || "");
      setPmId(appointment.pmId);
      setDate(appointment.date);
      setStartTime(appointment.startTime);
      setEndTime(appointment.endTime);
      setType(appointment.type);
      setStatus(appointment.status);
      setMeetingLink(appointment.meetingLink || "");
      setLocation(appointment.location || "");
      setNotes(appointment.notes || "");
    }
  }, [appointment, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!appointment || !title.trim() || !pmId || !date || !startTime || !endTime) return;

    const selectedPM = mockPMs.find((pm) => pm.id === pmId);
    if (!selectedPM) return;

    const duration = calculateDuration(startTime, endTime);

    onUpdate(appointment.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      pmId,
      pmName: selectedPM.name,
      date,
      startTime,
      endTime,
      duration,
      type,
      status,
      meetingLink: type === "online" ? meetingLink.trim() || undefined : undefined,
      location: type === "offline" ? location.trim() || undefined : undefined,
      notes: notes.trim() || undefined,
    });

    onOpenChange(false);
  }

  function calculateDuration(start: string, end: string): number {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    return endTotal - startTotal;
  }

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" key={appointment.id}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Update appointment details</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-title"
                placeholder="Enter appointment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter appointment description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-pm">
                  Project Manager <span className="text-destructive">*</span>
                </Label>
                <Select value={pmId} onValueChange={setPmId} required>
                  <SelectTrigger id="edit-pm">
                    <SelectValue placeholder="Select PM" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePMs.map((pm) => (
                      <SelectItem key={pm.id} value={pm.id}>
                        {pm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-startTime">
                  Start Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-endTime">
                  End Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-type">Meeting Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as MeetingType)}>
                <SelectTrigger id="edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      <Monitor className="size-4" />
                      Online
                    </div>
                  </SelectItem>
                  <SelectItem value="offline">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      Offline
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "online" ? (
              <div className="grid gap-2">
                <Label htmlFor="edit-meetingLink">Meeting Link</Label>
                <Input
                  id="edit-meetingLink"
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  placeholder="Enter meeting location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Meeting Notes</Label>
              <Textarea
                id="edit-notes"
                placeholder="Enter meeting notes or outcomes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div>
              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (appointment && confirm("Are you sure you want to delete this appointment?")) {
                      onDelete(appointment.id);
                      onOpenChange(false);
                    }
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Appointment</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

