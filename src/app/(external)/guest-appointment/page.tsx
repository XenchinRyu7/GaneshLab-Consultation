import { Card } from "@/components/card";
import { Navigation } from "@/components/nav";

import { GuestAppointmentForm } from "./_components/guest-appointment-form";

export default function GuestAppointmentPage() {
  return (
    <div className="min-h-screen bg-linear-to-tl from-zinc-900/0 via-zinc-900 to-zinc-900/0">
      <Navigation />
      <div className="container mx-auto flex min-h-screen items-start justify-center px-4 pt-24 pb-8">
        <div className="mx-auto w-full max-w-3xl">
          <Card>
            <div className="p-8 md:p-16">
              <div className="mb-8 text-center">
                <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
                  Buat Janji Temu
                </h1>
                <p className="mt-4 text-lg text-zinc-400">
                  Isi formulir di bawah ini untuk membuat janji temu dengan tim kami. Admin akan
                  menghubungi Anda untuk konfirmasi.
                </p>
              </div>

              <GuestAppointmentForm />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
