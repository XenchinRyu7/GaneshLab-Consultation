"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useRouter } from "@/i18n/routing";

import { AppointmentDetailsSection } from "./appointment-details-section";
import { FormValues, formSchema } from "./form-schema";
import { PersonalInfoSection } from "./personal-info-section";

export function GuestAppointmentForm() {
  const router = useRouter();
  const t = useTranslations("GuestAppointment");
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
      // Convert Date object to YYYY-MM-DD string in local timezone
      const dateStr = values.date
        ? `${values.date.getFullYear()}-${String(values.date.getMonth() + 1).padStart(2, "0")}-${String(values.date.getDate()).padStart(2, "0")}`
        : "";

      const response = await fetch("/api/appointments/guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          preferredDate: dateStr,
          date: dateStr,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Gagal membuat janji temu");
      }

      toast.success(t("successMessage"), { duration: 3000 });

      form.reset();

      setTimeout(() => {
        router.push("/");
      }, 3500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errorMessage"));
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
          className="w-full rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? t("submitting") : t("submitButton")}
        </Button>
      </form>
    </Form>
  );
}
