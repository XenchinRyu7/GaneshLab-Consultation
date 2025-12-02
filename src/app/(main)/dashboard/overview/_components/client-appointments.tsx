"use client";

import { Calendar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Appointment {
  id: string;
  date: string;
  time: string;
  title: string;
  picName: string;
  status: string;
}

interface ClientAppointmentsProps {
  appointments: Appointment[];
}

export function ClientAppointments({ appointments }: ClientAppointmentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="size-5" />
          Upcoming Appointments
        </CardTitle>
        <CardDescription>Your scheduled meetings and consultations</CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="w-full space-y-3">
          {appointments.length > 0 ? (
            appointments.slice(0, 3).map(appointment => (
              <div
                key={appointment.id}
                className="bg-muted/50 flex items-center justify-between rounded-lg p-3"
              >
                <div>
                  <div className="font-medium">
                    {appointment.date}, {appointment.time}
                  </div>
                  <div className="text-muted-foreground text-sm">{appointment.title}</div>
                  <div className="text-muted-foreground text-xs">PIC: {appointment.picName}</div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    appointment.status === "confirmed"
                      ? "text-green-600"
                      : appointment.status === "pending"
                        ? "text-orange-600"
                        : "text-gray-600"
                  }
                >
                  {appointment.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground py-4 text-center">No upcoming appointments</div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
