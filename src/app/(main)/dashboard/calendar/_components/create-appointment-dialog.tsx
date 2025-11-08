"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
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
import type { Appointment, PMAvailabilitySlot, MeetingType, AppointmentStatus } from "./calendar-config";
import { mockPMs } from "./calendar-config";

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => void;
  initialSlot?: PMAvailabilitySlot;
  projectContext?: { assignedPMId?: string };
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  onSave,
  initialSlot,
  projectContext,
}: CreateAppointmentDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pmId, setPmId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState<MeetingType>("online");
  const [meetingLink, setMeetingLink] = useState("");
  const [location, setLocation] = useState("");

  // Available PMs based on project context
  const availablePMs = projectContext?.assignedPMId
    ? mockPMs.filter((pm) => pm.id === projectContext.assignedPMId)
    : mockPMs;

  // Initialize form from slot if provided
  useEffect(() => {
    if (initialSlot && open) {
      setPmId(initialSlot.pmId);
      setDate(initialSlot.date);
      setStartTime(initialSlot.startTime);
      setEndTime(initialSlot.endTime);
      setType(initialSlot.type);
    } else if (open) {
      // Reset form
      setTitle("");
      setDescription("");
      setPmId("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setStartTime("");
      setEndTime("");
      setType("online");
      setMeetingLink("");
      setLocation("");
    }
  }, [initialSlot, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !pmId || !date || !startTime || !endTime) return;

    const selectedPM = mockPMs.find((pm) => pm.id === pmId);
    if (!selectedPM) return;

    const duration = calculateDuration(startTime, endTime);

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      clientId: "client-1", // TODO: Get from auth
      clientName: "Client ABC", // TODO: Get from auth
      pmId,
      pmName: selectedPM.name,
      date,
      startTime,
      endTime,
      duration,
      type,
      meetingLink: type === "online" ? meetingLink.trim() || undefined : undefined,
      location: type === "offline" ? location.trim() || undefined : undefined,
      status: "pending",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Appointment</DialogTitle>
            <DialogDescription>Schedule a new meeting with a Project Manager</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter appointment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter appointment description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pm">
                  Project Manager <span className="text-destructive">*</span>
                </Label>
                <Select value={pmId} onValueChange={setPmId} required>
                  <SelectTrigger id="pm">
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
                <Label htmlFor="date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">
                  Start Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endTime">
                  End Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Meeting Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as MeetingType)}>
                <SelectTrigger id="type">
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
                <Label htmlFor="meetingLink">Meeting Link</Label>
                <Input
                  id="meetingLink"
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter meeting location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Appointment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

