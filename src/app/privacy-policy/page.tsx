import { Navigation } from "@/components/nav";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="container mx-auto min-h-screen px-4 pt-24 pb-8">
        <h1 className="mb-6 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mb-8 text-sm text-zinc-400">Last updated: November 25, 2025</p>

        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">1. Information We Collect</h2>
            <p className="text-zinc-300">
              We collect personal information such as your name, email, and profile data when you
              register. For calendar integration, we may access your Google Calendar data with your
              consent.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              2. How We Use Your Information
            </h2>
            <p className="text-zinc-300">
              Your information is used to provide consultation services, manage chats, projects, and
              calendar availability. We do not share your data with third parties without your
              consent.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">3. Data Security</h2>
            <p className="text-zinc-300">
              We implement appropriate security measures to protect your personal information
              against unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">4. Contact Us</h2>
            <p className="text-zinc-300">
              If you have questions about this Privacy Policy, please contact us at
              support@ganeshlab-consultation.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
