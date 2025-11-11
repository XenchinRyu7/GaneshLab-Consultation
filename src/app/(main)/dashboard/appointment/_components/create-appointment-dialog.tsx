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
import { TimePicker } from "@/components/ui/time-picker";
import { Monitor, MapPin } from "lucide-react";
import type { Appointment, PMAvailabilitySlot, MeetingType, PIC } from "./calendar-config";
import type { ProjectContext } from "./calendar-config";

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => void;
  initialSlot?: PMAvailabilitySlot;
  projectContext?: ProjectContext;
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
  const [pics, setPics] = useState<PIC[]>([]);
  const [loadingPics, setLoadingPics] = useState(false);

  // Fetch PICs
  useEffect(() => {
    fetchPICs();
  }, [projectContext]);

  async function fetchPICs() {
    try {
      setLoadingPics(true);
      const response = await fetch("/api/projects/pics");
      if (!response.ok) {
        throw new Error("Failed to fetch PICs");
      }
      const data = await response.json();
      let fetchedPics: PIC[] = (data.pics || []).map((pic: any) => ({
        id: pic.id,
        name: pic.fullname,
        email: pic.email,
      }));

      // Filter by project context if assignedPMId exists
      if (projectContext?.assignedPMId) {
        fetchedPics = fetchedPics.filter((pic: PIC) => pic.id === projectContext.assignedPMId);
      }

      setPics(fetchedPics);

      // Auto-select PIC if only one available
      if (fetchedPics.length === 1) {
        setPmId(fetchedPics[0].id);
      } else if (projectContext?.assignedPMId) {
        // If project context exists, set the assigned PIC
        setPmId(projectContext.assignedPMId);
      }
    } catch (error) {
      console.error("Error fetching PICs:", error);
    } finally {
      setLoadingPics(false);
    }
  }

  // Initialize form from initialSlot
  useEffect(() => {
    if (initialSlot && open) {
      setPmId(initialSlot.pmId);
      setDate(initialSlot.date);
      setStartTime(initialSlot.startTime);
      setEndTime(initialSlot.endTime);
      setType(initialSlot.type);
      setTitle("");
      setDescription("");
      setMeetingLink("");
      setLocation("");
    } else if (open) {
      // Reset form
      setTitle("");
      setDescription("");
      setPmId("");
      setDate("");
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

    const selectedPM = pics.find((pm) => pm.id === pmId);
    if (!selectedPM) return;

    const duration = calculateDuration(startTime, endTime);

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      clientId: "", // Will be set by parent component
      clientName: "", // Will be set by parent component
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
      projectId: projectContext?.projectId,
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
        <DialogHeader>
          <DialogTitle>Create Appointment</DialogTitle>
          <DialogDescription>
            Schedule a new appointment with a PIC
            {projectContext?.projectName && ` for project "${projectContext.projectName}"`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meeting description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pic">PIC *</Label>
            <Select value={pmId} onValueChange={setPmId} required disabled={loadingPics || !!projectContext?.assignedPMId}>
              <SelectTrigger id="pic">
                <SelectValue placeholder={loadingPics ? "Loading PICs..." : "Select PIC"} />
              </SelectTrigger>
              <SelectContent>
                {pics.map((pic) => (
                  <SelectItem key={pic.id} value={pic.id}>
                    {pic.name} ({pic.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {projectContext?.assignedPMId && (
              <p className="text-xs text-muted-foreground">
                PIC is automatically selected based on active project
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Meeting Type *</Label>
              <Select value={type} onValueChange={(value) => setType(value as MeetingType)}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                id="startTime"
              />
            </div>

            <div className="space-y-2">
              <Label>End Time *</Label>
              <TimePicker
                value={endTime}
                onChange={setEndTime}
                id="endTime"
              />
            </div>
          </div>

          {type === "online" && (
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
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
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Meeting location"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title || !pmId || !date || !startTime || !endTime}>
              Create Appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

