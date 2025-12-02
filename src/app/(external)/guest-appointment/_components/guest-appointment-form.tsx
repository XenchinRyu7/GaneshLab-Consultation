"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { AppointmentDetailsSection } from "./appointment-details-section";
import { FormValues, formSchema } from "./form-schema";
import { PersonalInfoSection } from "./personal-info-section";

export function GuestAppointmentForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      guestOrganization: "",
      title: "",
      guestPurpose: "",
      type: "online",
      duration: "60",
      preferredTime: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/appointments/guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Gagal membuat janji temu");
      }

      toast.success(
        "Permintaan janji temu Anda telah dikirim. Admin akan segera menghubungi Anda."
      );

      form.reset();

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalInfoSection control={form.control} />
        <AppointmentDetailsSection control={form.control} />

        <Button
          type="submit"
          className="w-full bg-zinc-100 font-medium text-zinc-900 transition-colors duration-200 hover:bg-zinc-200 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Mengirim..." : "Kirim Permintaan"}
        </Button>
      </form>
    </Form>
  );
}
