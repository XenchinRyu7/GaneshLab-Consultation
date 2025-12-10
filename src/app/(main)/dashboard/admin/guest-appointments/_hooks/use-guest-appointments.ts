"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

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

export function useGuestAppointments() {
  const [appointments, setAppointments] = useState<GuestAppointment[]>([]);
  const [pics, setPics] = useState<PIC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuestAppointments();
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

  async function fetchAvailablePICs(date: string, startTime: string, endTime: string) {
    try {
      // Extract date string only (YYYY-MM-DD) if it's an ISO string
      const dateStr = date.includes("T") ? date.split("T")[0] : date;

      const params = new URLSearchParams({ date: dateStr, startTime, endTime });
      const response = await fetch(`/api/admin/guest-appointments/available-pics?${params}`);
      if (!response.ok) throw new Error("Failed to fetch available PICs");
      const data = await response.json();
      setPics(data.pics ?? []);
    } catch (error) {
      console.error("Error fetching available PICs:", error);
      toast.error("Gagal memuat daftar PIC yang tersedia");
      setPics([]);
    }
  }

  return {
    appointments,
    pics,
    loading,
    fetchGuestAppointments,
    fetchAvailablePICs,
    setAppointments,
    setPics,
  };
}
