import { getTranslations } from "next-intl/server";

import { Card } from "@/components/card";
import { Navigation } from "@/components/nav";

import { GuestAppointmentForm } from "./_components/guest-appointment-form";

export async function generateMetadata() {
  return {
    title: "Guest Appointment - GaneshLab",
    description: "Book an appointment with our team without creating an account.",
  };
}

export default async function GuestAppointmentPage() {
  const t = await getTranslations("GuestAppointment");

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto flex min-h-screen items-start justify-center px-4 pt-24 pb-8">
        <div className="mx-auto w-full max-w-3xl">
          <Card>
            <div className="bg-white p-8 md:p-16">
              <div className="mb-8 text-center">
                <h1 className="font-display text-4xl font-bold tracking-tight text-black sm:text-5xl">
                  {t("title")}
                </h1>
                <p className="mt-4 text-lg text-zinc-400">{t("description")}</p>
              </div>

              <GuestAppointmentForm />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
