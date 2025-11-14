/**
 * Form component for CreateAppointmentDialog
 */

import { Button } from "@/components/ui/button";

import type { MeetingType, PIC, ProjectContext } from "./calendar-config";
import {
  MeetingLocationFields,
  PICField,
  TimeFields,
  TitleDescriptionFields,
  DateTypeFields,
} from "./create-appointment-dialog-form-fields";

interface CreateAppointmentDialogFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  pmId: string;
  setPmId: (id: string) => void;
  pics: PIC[];
  loadingPics: boolean;
  projectContext?: ProjectContext;
  date: string;
  setDate: (date: string) => void;
  type: MeetingType;
  setType: (type: MeetingType) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  meetingLink: string;
  setMeetingLink: (link: string) => void;
  location: string;
  setLocation: (location: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function CreateAppointmentDialogForm({
  title,
  setTitle,
  description,
  setDescription,
  pmId,
  setPmId,
  pics,
  loadingPics,
  projectContext,
  date,
  setDate,
  type,
  setType,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  meetingLink,
  setMeetingLink,
  location,
  setLocation,
  onSubmit,
  onCancel,
}: CreateAppointmentDialogFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <TitleDescriptionFields
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
      />

      <PICField
        pmId={pmId}
        setPmId={setPmId}
        pics={pics}
        loadingPics={loadingPics}
        projectContext={projectContext}
      />

      <DateTypeFields date={date} setDate={setDate} type={type} setType={setType} />

      <TimeFields
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
      />

      <MeetingLocationFields
        type={type}
        meetingLink={meetingLink}
        setMeetingLink={setMeetingLink}
        location={location}
        setLocation={setLocation}
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title || !pmId || !date || !startTime || !endTime}>
          Create Appointment
        </Button>
      </div>
    </form>
  );
}
