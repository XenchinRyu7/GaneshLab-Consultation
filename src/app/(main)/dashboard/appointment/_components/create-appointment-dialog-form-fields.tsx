/**
 * Form field components for CreateAppointmentDialogForm
 */

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

import type { MeetingType, PIC, ProjectContext } from "./calendar-config";

interface TitleDescriptionFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (desc: string) => void;
}

export function TitleDescriptionFields({
  title,
  setTitle,
  description,
  setDescription,
}: TitleDescriptionFieldsProps) {
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
    </>
  );
}

interface PICFieldProps {
  pmId: string;
  setPmId: (id: string) => void;
  pics: PIC[];
  loadingPics: boolean;
  projectContext?: ProjectContext;
}

export function PICField({ pmId, setPmId, pics, loadingPics, projectContext }: PICFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="pic">PIC *</Label>
      <Select
        value={pmId}
        onValueChange={setPmId}
        required
        disabled={loadingPics || !!projectContext?.assignedPMId}
      >
        <SelectTrigger id="pic">
          <SelectValue placeholder={loadingPics ? "Loading PICs..." : "Select PIC"} />
        </SelectTrigger>
        <SelectContent>
          {pics.map(pic => (
            <SelectItem key={pic.id} value={pic.id}>
              {pic.name} ({pic.email})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {projectContext?.assignedPMId && (
        <p className="text-muted-foreground text-xs">
          PIC is automatically selected based on active project
        </p>
      )}
    </div>
  );
}

interface DateTypeFieldsProps {
  date: string;
  setDate: (date: string) => void;
  type: MeetingType;
  setType: (type: MeetingType) => void;
}

export function DateTypeFields({ date, setDate, type, setType }: DateTypeFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          required
        />
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
    </div>
  );
}

interface TimeFieldsProps {
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
}

export function TimeFields({ startTime, setStartTime, endTime, setEndTime }: TimeFieldsProps) {
  return (
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
  );
}

interface MeetingLocationFieldsProps {
  type: MeetingType;
  meetingLink: string;
  setMeetingLink: (link: string) => void;
  location: string;
  setLocation: (location: string) => void;
}

export function MeetingLocationFields({
  type,
  meetingLink,
  setMeetingLink,
  location,
  setLocation,
}: MeetingLocationFieldsProps) {
  if (type === "online") {
    return (
      <div className="space-y-2">
        <Label htmlFor="meetingLink">Meeting Link</Label>
        <Input
          id="meetingLink"
          value={meetingLink}
          onChange={e => setMeetingLink(e.target.value)}
          placeholder="https://meet.google.com/..."
        />
      </div>
    );
  }

  if (type === "offline") {
    return (
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Meeting location"
        />
      </div>
    );
  }

  return null;
}
