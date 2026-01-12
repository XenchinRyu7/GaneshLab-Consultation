"use client";

import { useState } from "react";

import { Mail, Building2, User, MessageSquare, LogIn, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card } from "@/components/card";
import { Link } from "@/i18n/routing";

export default function WaitlistPage() {
  const t = useTranslations("GetStarted");

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    type: "personal",
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
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          fullname: "",
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
    <div className="min-h-screen bg-white">
      <header>
        <div
          className={`bg-white/0" : "border-gray-200 bg-white/500" fixed inset-x-0 top-0 z-50 border-b border-transparent backdrop-blur duration-200`}
        >
          <div className="container mx-auto p-6">
            <Link href="/" className="text-black duration-200">
              <ArrowLeft className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </header>
      <div className="container mx-auto flex min-h-screen items-start justify-center px-4 pt-24 pb-8">
        <div className="mx-auto w-full max-w-2xl">
          <Card>
            <div className="p-8 md:p-16">
              {/* Login Now Link */}
              <div className="mb-6 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-black transition-colors duration-200 hover:text-zinc-600"
                >
                  <LogIn size={16} />
                  {t("alreadyHaveAccount")}
                </Link>
              </div>

              <div className="mb-8 text-center">
                <h1 className="font-display text-4xl font-bold tracking-tight text-black sm:text-5xl">
                  {t("title")}
                </h1>
                <p className="mt-4 text-lg text-zinc-400">{t("description")}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="fullname"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-black"
                  >
                    <User size={16} />
                    {t("fullNameLabel")}
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    required
                    value={formData.fullname}
                    onChange={e => setFormData({ ...formData, fullname: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={t("fullNamePlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-black"
                  >
                    <Mail size={16} />
                    {t("emailLabel")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>

                <div>
                  <label className="mb-3 flex items-center gap-2 text-sm font-medium text-black">
                    <Building2 size={16} />
                    {t("typeLabel")}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value="personal"
                        checked={formData.type === "personal"}
                        onChange={e =>
                          setFormData({ ...formData, type: e.target.value, company: "" })
                        }
                        className="h-4 w-4 border-gray-300 bg-white text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-black">{t("personalType")}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value="company"
                        checked={formData.type === "company"}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="h-4 w-4 border-gray-300 bg-white text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-black">{t("companyType")}</span>
                    </label>
                  </div>
                </div>

                {formData.type === "company" && (
                  <div>
                    <label
                      htmlFor="company"
                      className="mb-2 flex items-center gap-2 text-sm font-medium text-black"
                    >
                      <Building2 size={16} />
                      {t("companyNameLabel")}
                    </label>
                    <input
                      type="text"
                      id="company"
                      required
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder={t("companyNamePlaceholder")}
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-black"
                  >
                    <MessageSquare size={16} />
                    {t("messageLabel")}
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-black placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={t("messagePlaceholder")}
                  />
                </div>

                {submitStatus === "success" && (
                  <div className="rounded-lg border border-green-800 bg-green-900/20 p-4 text-green-400">
                    {t("successMessage")}
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
                    {t("errorMessage")}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? t("submitting") : t("submitButton")}
                </button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
