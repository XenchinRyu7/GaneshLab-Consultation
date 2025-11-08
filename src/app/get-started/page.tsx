"use client";

import { useState } from "react";
import Link from "next/link";

import { Mail, Building2, User, MessageSquare, LogIn } from "lucide-react";

import { Card } from "@/components/card";
import { Navigation } from "@/components/nav";

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "personal", // personal or company
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          type: "personal",
          company: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tl from-zinc-900/0 via-zinc-900 to-zinc-900/0">
      <Navigation />
      <div className="container mx-auto flex min-h-screen items-start justify-center px-4 pt-24 pb-8">
        <div className="mx-auto w-full max-w-2xl">
          <Card>
            <div className="p-8 md:p-16">
              {/* Login Now Link */}
              <div className="mb-6 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors duration-200 hover:text-zinc-100"
                >
                  <LogIn size={16} />
                  Already have an account? Login Now
                </Link>
              </div>

              <div className="mb-8 text-center">
                <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
                  Schedule a Consultation
                </h1>
                <p className="mt-4 text-lg text-zinc-400">
                  Connect with our team to discuss your project needs. We&apos;ll send you login information to access
                  our platform after reviewing your request.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                    <User size={16} />
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-transparent focus:ring-2 focus:ring-zinc-500 focus:outline-none"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-transparent focus:ring-2 focus:ring-zinc-500 focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
                    <Building2 size={16} />
                    Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value="personal"
                        checked={formData.type === "personal"}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value, company: "" })}
                        className="h-4 w-4 border-zinc-700 bg-zinc-800 text-zinc-500 focus:ring-zinc-500"
                      />
                      <span className="text-zinc-300">Personal</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value="company"
                        checked={formData.type === "company"}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="h-4 w-4 border-zinc-700 bg-zinc-800 text-zinc-500 focus:ring-zinc-500"
                      />
                      <span className="text-zinc-300">Company</span>
                    </label>
                  </div>
                </div>

                {formData.type === "company" && (
                  <div>
                    <label htmlFor="company" className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <Building2 size={16} />
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-transparent focus:ring-2 focus:ring-zinc-500 focus:outline-none"
                      placeholder="Your company name"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="message" className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                    <MessageSquare size={16} />
                    What will you discuss with our team
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-transparent focus:ring-2 focus:ring-zinc-500 focus:outline-none"
                    placeholder="Describe what you need from GaneshLab..."
                  />
                </div>

                {submitStatus === "success" && (
                  <div className="rounded-lg border border-green-800 bg-green-900/20 p-4 text-green-400">
                    Thank you! We&apos;ve received your request and will review it shortly. You&apos;ll receive login
                    information via email to access our platform.
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
                    Something went wrong. Please try again or contact us directly.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-zinc-100 px-6 py-3 font-medium text-zinc-900 transition-colors duration-200 hover:bg-zinc-200 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
