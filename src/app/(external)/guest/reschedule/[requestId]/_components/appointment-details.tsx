"use client";

import { Calendar, Clock, Link as LinkIcon, MapPin } from "lucide-react";

interface AppointmentDetailsProps {
  appointment: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    type: "online" | "offline";
    meetingLink: string | null;
    location: string | null;
    pic: {
      fullname: string;
      email: string;
    } | null;
  };
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  newMeetingLink: string | null;
  reason: string | null;
}

export function AppointmentDetails({
  appointment,
  newDate,
  newStartTime,
  newEndTime,
  newMeetingLink,
  reason,
}: AppointmentDetailsProps) {
  return (
    <>
      {/* Current Appointment */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-200">
          <Calendar className="h-5 w-5" />
          Current Appointment
        </h2>
        <div className="space-y-2 text-zinc-300">
          <p>
            <span className="font-medium">Title:</span> {appointment.title}
          </p>
          <p>
            <span className="font-medium">Date:</span>{" "}
            {new Date(appointment.date).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p>
            <span className="font-medium">Time:</span> {appointment.startTime} -{" "}
            {appointment.endTime}
          </p>
          <p>
            <span className="font-medium">Type:</span>{" "}
            <span className="capitalize">{appointment.type}</span>
            {appointment.type === "online" && appointment.meetingLink && (
              <span className="ml-2 flex items-center gap-1 text-sm">
                <LinkIcon className="h-3 w-3" />
                <a
                  href={appointment.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Meeting Link
                </a>
              </span>
            )}
            {appointment.type === "offline" && appointment.location && (
              <span className="ml-2 flex items-center gap-1 text-sm">
                <MapPin className="h-3 w-3" />
                {appointment.location}
              </span>
            )}
          </p>
          {appointment.pic && (
            <p>
              <span className="font-medium">PIC:</span> {appointment.pic.fullname} (
              {appointment.pic.email})
            </p>
          )}
        </div>
      </div>

      {/* Proposed New Schedule */}
      <div className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-300">
          <Clock className="h-5 w-5" />
          Proposed New Schedule
        </h2>
        <div className="space-y-2 text-zinc-300">
          <p>
            <span className="font-medium">New Date:</span>{" "}
            {new Date(newDate).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p>
            <span className="font-medium">New Time:</span> {newStartTime} - {newEndTime}
          </p>
          <p>
            <span className="font-medium">Type:</span>{" "}
            <span className="capitalize">{appointment.type}</span>
            {appointment.type === "online" && newMeetingLink && (
              <span className="ml-2 flex items-center gap-1 text-sm">
                <LinkIcon className="h-3 w-3" />
                <a
                  href={newMeetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Meeting Link
                </a>
              </span>
            )}
            {appointment.type === "offline" && appointment.location && (
              <span className="ml-2 flex items-center gap-1 text-sm">
                <MapPin className="h-3 w-3" />
                {appointment.location}
              </span>
            )}
          </p>
          {reason && (
            <div className="mt-3 rounded border border-amber-700/30 bg-amber-950/10 p-3">
              <p className="text-sm">
                <span className="font-medium text-amber-200">Reason:</span>{" "}
                <span className="text-zinc-300">{reason}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
