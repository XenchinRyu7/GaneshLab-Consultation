"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, MoreHorizontal, Trash2, UserCheck, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type GuestAppointment = {
  id: string;
  title: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestOrganization?: string;
  guestPurpose: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  picId?: string;
  pic?: {
    fullname: string;
  };
  createdAt: string;
};

export function getGuestAppointmentColumns(
  onAssign: (appointment: GuestAppointment) => void,
  onApprove: (appointment: GuestAppointment) => void,
  onReject: (appointment: GuestAppointment) => void,
  onDelete: (appointment: GuestAppointment) => void
): ColumnDef<GuestAppointment>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "guestName",
      header: "Guest",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("guestName")}</div>
          <div className="text-muted-foreground text-sm">{row.original.guestEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: "guestOrganization",
      header: "Organization",
      cell: ({ row }) => row.getValue("guestOrganization") ?? "-",
    },
    {
      accessorKey: "date",
      header: "Date & Time",
      cell: ({ row }) => (
        <div>
          <div>{new Date(row.getValue("date")).toLocaleDateString()}</div>
          <div className="text-muted-foreground text-sm">
            {row.original.startTime} - {row.original.endTime}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <Badge variant="outline">{row.getValue("type")}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status: string = row.getValue("status");
        return (
          <Badge
            variant={
              status === "approved" ? "default" : status === "pending" ? "secondary" : "destructive"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "pic",
      header: "PIC",
      cell: ({ row }) => row.original.pic?.fullname ?? "Not assigned",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const appointment = row.original;
        const canAssign = !appointment.picId && appointment.status === "pending";
        const canApprove = appointment.status === "pending";
        const canReject = appointment.status === "pending";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canAssign && (
                <DropdownMenuItem onClick={() => onAssign(appointment)}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Assign PIC
                </DropdownMenuItem>
              )}
              {canApprove && (
                <DropdownMenuItem onClick={() => onApprove(appointment)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
              )}
              {canReject && (
                <DropdownMenuItem onClick={() => onReject(appointment)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(appointment)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
