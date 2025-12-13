import { Monitor, MapPin } from "lucide-react";

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

import type { MeetingType, AppointmentStatus } from "./calendar-config";

interface AppointmentFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
  type: MeetingType;
  setType: (value: MeetingType) => void;
  status: AppointmentStatus;
  setStatus: (value: AppointmentStatus) => void;
  meetingLink: string;
  setMeetingLink: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  isClient: boolean;
}

export function AppointmentFormFields({
  title,
  setTitle,
  description,
  setDescription,
  date,
  setDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  type,
  setType,
  status,
  setStatus,
  meetingLink,
  setMeetingLink,
  location,
  setLocation,
  notes,
  setNotes,
  isClient,
}: AppointmentFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Meeting title"
          required
          disabled={!isClient}
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
          disabled={!isClient}
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
            disabled={true}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={status}
            onValueChange={value => setStatus(value as AppointmentStatus)}
            disabled={isClient}
          >
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
          <TimePicker value={startTime} onChange={setStartTime} id="startTime" disabled={true} />
        </div>

        <div className="space-y-2">
          <Label>End Time *</Label>
          <TimePicker value={endTime} onChange={setEndTime} id="endTime" disabled={true} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Meeting Type *</Label>
        <Select value={type} onValueChange={value => setType(value as MeetingType)} disabled={true}>
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
            readOnly
            className="bg-muted/50 cursor-text"
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
            disabled={true}
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
    </>
  );
}
