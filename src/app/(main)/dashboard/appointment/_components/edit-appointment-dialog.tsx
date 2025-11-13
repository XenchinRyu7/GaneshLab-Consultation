"use client";

import { useState } from "react";

import { Monitor, MapPin, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/ui/time-picker";

import type {
  Appointment,
  MeetingType,
  AppointmentStatus,
  ProjectContext,
} from "./calendar-config";

interface EditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onUpdate: (appointmentId: string, updates: Partial<Appointment>) => void;
  onDelete: (appointmentId: string) => void;
  projectContext?: ProjectContext;
}

export function EditAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onUpdate,
  onDelete,
  projectContext,
}: EditAppointmentDialogProps) {
  // Initialize state from appointment using lazy initialization
  // Key prop on Dialog will reset state when appointment.id changes
  const [title, setTitle] = useState(() => appointment?.title ?? "");
  const [description, setDescription] = useState(() => appointment?.description ?? "");
  const [date, setDate] = useState(() => appointment?.date ?? "");
  const [startTime, setStartTime] = useState(() => appointment?.startTime ?? "");
  const [endTime, setEndTime] = useState(() => appointment?.endTime ?? "");
  const [type, setType] = useState<MeetingType>(() => appointment?.type ?? "online");
  const [status, setStatus] = useState<AppointmentStatus>(() => appointment?.status ?? "pending");
  const [meetingLink, setMeetingLink] = useState(() => appointment?.meetingLink ?? "");
  const [location, setLocation] = useState(() => appointment?.location ?? "");
  const [notes, setNotes] = useState(() => appointment?.notes ?? "");

  function validateForm(): boolean {
    return !!(appointment && title.trim() && date && startTime && endTime);
  }

  function buildUpdatePayload(): Partial<Appointment> {
    return {
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime,
      endTime,
      duration: calculateDuration(startTime, endTime),
      type,
      status,
      meetingLink: type === "online" ? meetingLink.trim() || undefined : undefined,
      location: type === "offline" ? location.trim() || undefined : undefined,
      notes: notes.trim() || undefined,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    if (!appointment) return;
    onUpdate(appointment.id, buildUpdatePayload());
    onOpenChange(false);
  }

  function calculateDuration(start: string, end: string): number {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);
    const startTotal = startHour * 60 + startMin;
    const endTotal = endHour * 60 + endMin;
    return endTotal - startTotal;
  }

  function handleDelete() {
    if (!appointment) return;
    onDelete(appointment.id);
    onOpenChange(false);
  }

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={appointment.id}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>
            Update appointment details
            {projectContext?.projectName && ` for project "${projectContext.projectName}"`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Meeting title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Meeting description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={value => setStatus(value as AppointmentStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <TimePicker value={startTime} onChange={setStartTime} id="startTime" />
            </div>

            <div className="space-y-2">
              <Label>End Time *</Label>
              <TimePicker value={endTime} onChange={setEndTime} id="endTime" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Meeting Type *</Label>
            <Select value={type} onValueChange={value => setType(value as MeetingType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Online
                  </div>
                </SelectItem>
                <SelectItem value="offline">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Offline
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "online" && (
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                value={meetingLink}
                onChange={e => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}

          {type === "offline" && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Meeting location"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Meeting notes or outcomes"
              rows={3}
            />
          </div>

          <DialogFooter className="flex items-center justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!title || !date || !startTime || !endTime}>
                Update Appointment
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
