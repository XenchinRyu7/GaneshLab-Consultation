"use client";

import { useEffect, useState } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

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

type PIC = {
  id: string;
  fullname: string;
  email: string;
};

export default function GuestAppointmentsPage() {
  const [appointments, setAppointments] = useState<GuestAppointment[]>([]);
  const [pics, setPics] = useState<PIC[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<GuestAppointment | null>(null);
  const [selectedPicId, setSelectedPicId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchGuestAppointments();
    fetchPICs();
  }, []);

  async function fetchGuestAppointments() {
    try {
      const response = await fetch("/api/admin/guest-appointments");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setAppointments(data.appointments);
    } catch {
      toast.error("Gagal memuat data guest appointments");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPICs() {
    try {
      const response = await fetch("/api/users?role=pic");
      if (!response.ok) throw new Error("Failed to fetch PICs");
      const data = await response.json();
      setPics(data.users ?? []);
    } catch (error) {
      console.error("Error fetching PICs:", error);
    }
  }

  async function handleAssignPIC() {
    if (!selectedAppointment || !selectedPicId) return;

    setIsAssigning(true);
    try {
      const response = await fetch(
        `/api/admin/guest-appointments/${selectedAppointment.id}/assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ picId: selectedPicId }),
        }
      );

      if (!response.ok) throw new Error("Failed to assign PIC");

      toast.success("PIC berhasil ditugaskan");

      setAssignDialogOpen(false);
      setSelectedAppointment(null);
      setSelectedPicId("");
      fetchGuestAppointments();
    } catch {
      toast.error("Gagal menugaskan PIC");
    } finally {
      setIsAssigning(false);
    }
  }

  const columns: ColumnDef<GuestAppointment>[] = [
    {
      accessorKey: "guestName",
      header: "Nama",
    },
    {
      accessorKey: "guestEmail",
      header: "Email",
    },
    {
      accessorKey: "guestPhone",
      header: "Telepon",
    },
    {
      accessorKey: "guestOrganization",
      header: "Organisasi",
      cell: ({ row }) => row.original.guestOrganization ?? "-",
    },
    {
      accessorKey: "title",
      header: "Judul",
    },
    {
      accessorKey: "date",
      header: "Tanggal",
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString("id-ID"),
    },
    {
      accessorKey: "startTime",
      header: "Waktu",
      cell: ({ row }) => `${row.original.startTime} - ${row.original.endTime}`,
    },
    {
      accessorKey: "type",
      header: "Tipe",
      cell: ({ row }) => (
        <Badge variant={row.original.type === "online" ? "default" : "secondary"}>
          {row.original.type === "online" ? "Online" : "Offline"}
        </Badge>
      ),
    },
    {
      accessorKey: "pic",
      header: "PIC",
      cell: ({ row }) =>
        row.original.pic?.fullname ?? <Badge variant="outline">Belum ditugaskan</Badge>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variant =
          status === "confirmed"
            ? "default"
            : status === "pending"
              ? "secondary"
              : status === "cancelled"
                ? "destructive"
                : "outline";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const appointment = row.original;

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
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setSelectedPicId(appointment.picId ?? "");
                  setAssignDialogOpen(true);
                }}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                {appointment.picId ? "Ubah PIC" : "Tugaskan PIC"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Nama: ${appointment.guestName}\nEmail: ${appointment.guestEmail}\nTelepon: ${appointment.guestPhone}\nKeperluan: ${appointment.guestPurpose}`
                  );
                  toast.success("Detail disalin ke clipboard");
                }}
              >
                Copy Detail
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useDataTableInstance({
    data: appointments,
    columns,
    getRowId: row => row.id,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Guest Appointments</h1>
        <p className="text-muted-foreground">Kelola janji temu dari tamu yang belum terdaftar</p>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <DataTable<GuestAppointment, unknown> table={table} columns={columns} />
      )}

      {/* Assign PIC Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tugaskan PIC</DialogTitle>
            <DialogDescription>Pilih PIC yang akan menangani appointment ini</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Appointment</Label>
              <p className="text-muted-foreground text-sm">{selectedAppointment?.title}</p>
              <p className="text-muted-foreground text-sm">
                {selectedAppointment?.guestName} - {selectedAppointment?.guestEmail}
              </p>
            </div>
            <div>
              <Label htmlFor="pic-select">Pilih PIC</Label>
              <Select value={selectedPicId} onValueChange={setSelectedPicId}>
                <SelectTrigger id="pic-select">
                  <SelectValue placeholder="Pilih PIC" />
                </SelectTrigger>
                <SelectContent>
                  {pics.map(pic => (
                    <SelectItem key={pic.id} value={pic.id}>
                      {pic.fullname} ({pic.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAssignPIC} disabled={!selectedPicId || isAssigning}>
              {isAssigning ? "Menugaskan..." : "Tugaskan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
