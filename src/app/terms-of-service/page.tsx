import { Navigation } from "@/components/nav";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="container mx-auto min-h-screen px-4 pt-24 pb-8">
        <h1 className="mb-6 text-3xl font-bold text-white">Terms of Service</h1>
        <p className="mb-8 text-sm text-zinc-400">Last updated: November 25, 2025</p>

        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p className="text-zinc-300">
              By accessing and using GaneshLab Consultation, you accept and agree to be bound by the
              terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">2. Use License</h2>
            <p className="text-zinc-300">
              Permission is granted to temporarily use the app for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">3. User Responsibilities</h2>
            <p className="text-zinc-300">
              Users must maintain confidentiality of account information and are responsible for all
              activities under their account. Prohibited activities include harassment, spam, or
              unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">4. Service Availability</h2>
            <p className="text-zinc-300">
              We strive to provide continuous service but do not guarantee uninterrupted access. We
              reserve the right to modify or discontinue services.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">5. Limitation of Liability</h2>
            <p className="text-zinc-300">
              In no event shall GaneshLab Consultation be liable for any damages arising out of the
              use or inability to use the app.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">6. Contact Information</h2>
            <p className="text-zinc-300">
              For questions about these Terms of Service, please contact us at
              support@ganeshlab-consultation.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
