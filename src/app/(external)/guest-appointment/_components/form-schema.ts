import * as z from "zod";

export const formSchema = z.object({
  guestName: z.string().min(3, "Nama minimal 3 karakter"),
  guestEmail: z.string().email("Email tidak valid"),
  guestPhone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  guestOrganization: z.string().optional(),
  title: z.string().min(5, "Judul minimal 5 karakter"),
  guestPurpose: z.string().min(10, "Tujuan minimal 10 karakter"),
  date: z.date({
    required_error: "Tanggal harus dipilih",
  }),
  duration: z.enum(["30", "60", "90", "120"], {
    required_error: "Durasi harus dipilih",
  }),
  type: z.enum(["online", "offline"], {
    required_error: "Tipe pertemuan harus dipilih",
  }),
  preferredTime: z.string().min(1, "Waktu preferensi harus diisi"),
});

export type FormValues = z.infer<typeof formSchema>;
