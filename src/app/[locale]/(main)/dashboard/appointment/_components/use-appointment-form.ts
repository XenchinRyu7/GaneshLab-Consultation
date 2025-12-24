import { useState, useEffect } from "react";

import type { Appointment, MeetingType, AppointmentStatus } from "./calendar-config";

interface UseAppointmentFormProps {
  appointment: Appointment | null;
}

export function useAppointmentForm({ appointment }: UseAppointmentFormProps) {
  const [title, setTitle] = useState(appointment?.title ?? "");
  const [description, setDescription] = useState(appointment?.description ?? "");
  const [date, setDate] = useState(appointment?.date ?? "");
  const [startTime, setStartTime] = useState(appointment?.startTime ?? "");
  const [endTime, setEndTime] = useState(appointment?.endTime ?? "");
  const [type, setType] = useState<MeetingType>(appointment?.type ?? "online");
  const [status, setStatus] = useState<AppointmentStatus>(appointment?.status ?? "pending");
  const [meetingLink, setMeetingLink] = useState(appointment?.meetingLink ?? "");
  const [location, setLocation] = useState(appointment?.location ?? "");
  const [notes, setNotes] = useState(appointment?.notes ?? "");

  useEffect(() => {
    if (appointment) {
      const timeoutId = setTimeout(() => {
        setTitle(appointment.title);
        setDescription(appointment.description ?? "");
        setDate(appointment.date);
        setStartTime(appointment.startTime);
        setEndTime(appointment.endTime);
        setType(appointment.type);
        setStatus(appointment.status);
        setMeetingLink(appointment.meetingLink ?? "");
        setLocation(appointment.location ?? "");
        setNotes(appointment.notes ?? "");
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [appointment]);

  return {
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
  };
}
