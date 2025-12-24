"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams, useSearchParams } from "next/navigation";

import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "@/i18n/routing";

import { ActionButtons } from "./_components/action-buttons";
import { AlternativeScheduleForm } from "./_components/alternative-schedule-form";
import { AppointmentDetails } from "./_components/appointment-details";

interface RescheduleRequestData {
  id: string;
  appointment: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    type: "online" | "offline";
    meetingLink: string | null;
    location: string | null;
    guestName: string;
    guestEmail: string;
    pic: {
      fullname: string;
      email: string;
    } | null;
  };
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  newMeetingLink: string | null;
  reason: string | null;
  status: string;
}

export default function GuestReschedulePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = params.requestId as string;
  const actionFromUrl = searchParams.get("action");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<RescheduleRequestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoActionProcessed, setAutoActionProcessed] = useState(false);
  const [showAlternativeForm, setShowAlternativeForm] = useState(false);
  const [alternativeDate, setAlternativeDate] = useState("");
  const [alternativeStartTime, setAlternativeStartTime] = useState("");
  const [alternativeEndTime, setAlternativeEndTime] = useState("");
  const [alternativeReason, setAlternativeReason] = useState("");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`/api/guest/reschedule/${requestId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error ?? "Failed to load reschedule request");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load request");
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  const handleAction = useCallback(
    async (action: "approve" | "reject") => {
      if (!data) return;

      // Reject REQUIRES alternative schedule - validate first
      if (action === "reject") {
        if (!showAlternativeForm) {
          // Show form first
          setShowAlternativeForm(true);
          return;
        }
        if (!alternativeDate || !alternativeStartTime || !alternativeEndTime) {
          toast.error(
            "Please fill in all alternative schedule fields (date, start time, and end time are required)"
          );
          return;
        }
      }

      setSubmitting(true);
      try {
        const requestBody: {
          action: string;
          alternativeDate?: string;
          alternativeStartTime?: string;
          alternativeEndTime?: string;
          alternativeReason?: string;
        } = { action };

        // Reject ALWAYS requires alternative schedule
        if (action === "reject") {
          if (!alternativeDate || !alternativeStartTime || !alternativeEndTime) {
            toast.error("Alternative schedule is required when rejecting");
            setSubmitting(false);
            return;
          }
          requestBody.alternativeDate = alternativeDate;
          requestBody.alternativeStartTime = alternativeStartTime;
          requestBody.alternativeEndTime = alternativeEndTime;
          if (alternativeReason) {
            requestBody.alternativeReason = alternativeReason;
          }
        }

        const response = await fetch(`/api/guest/reschedule/${requestId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error ?? "Failed to process request");
        }

        await response.json();
        toast.success(
          action === "approve"
            ? "Reschedule request approved successfully! Appointment has been updated."
            : "Reschedule request rejected. Appointment has been updated with your proposed alternative schedule."
        );

        // Update local state
        setData(prev =>
          prev ? { ...prev, status: action === "approve" ? "approved" : "rejected" } : null
        );
        setShowAlternativeForm(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to process request");
      } finally {
        setSubmitting(false);
      }
    },
    [
      data,
      requestId,
      showAlternativeForm,
      alternativeDate,
      alternativeStartTime,
      alternativeEndTime,
      alternativeReason,
    ]
  );

  // Auto-process action from email link (only approve, reject requires alternative schedule)
  useEffect(() => {
    if (
      !loading &&
      data &&
      !autoActionProcessed &&
      actionFromUrl === "approve" &&
      data.status === "pending"
    ) {
      setAutoActionProcessed(true);
      handleAction("approve");
      // Remove action from URL
      router.replace(`/guest/reschedule/${requestId}`);
    } else if (
      !loading &&
      data &&
      !autoActionProcessed &&
      actionFromUrl === "reject" &&
      data.status === "pending"
    ) {
      // For reject, just show the form (can't auto-process without alternative schedule)
      setAutoActionProcessed(true);
      setShowAlternativeForm(true);
      // Remove action from URL
      router.replace(`/guest/reschedule/${requestId}`, { scroll: false });
    }
  }, [loading, data, actionFromUrl, autoActionProcessed, requestId, router, handleAction]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-zinc-400" />
          <p className="mt-4 text-zinc-400">Loading reschedule request...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900 px-4">
        <Card className="w-full max-w-md border-zinc-700 bg-zinc-800/50 p-8">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h1 className="mt-4 text-xl font-semibold text-zinc-100">Error</h1>
            <p className="mt-2 text-zinc-400">{error ?? "Reschedule request not found"}</p>
            <Button
              onClick={() => router.push("/")}
              className="mt-6 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
            >
              Go to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isProcessed = data.status !== "pending";

  return (
    <div className="min-h-screen bg-linear-to-tl from-zinc-900/0 via-zinc-900 to-zinc-900/0">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
        <Card className="w-full max-w-2xl border-zinc-700 bg-zinc-800/50 p-8 md:p-12">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              Appointment Reschedule Request
            </h1>
            <p className="mt-4 text-lg text-zinc-400">
              {isProcessed
                ? "This request has already been processed."
                : "Please review and respond to the reschedule request below."}
            </p>
          </div>

          <div className="space-y-6">
            <AppointmentDetails
              appointment={data.appointment}
              newDate={data.newDate}
              newStartTime={data.newStartTime}
              newEndTime={data.newEndTime}
              newMeetingLink={data.newMeetingLink}
              reason={data.reason}
            />

            {/* Status Badge */}
            {isProcessed && (
              <div className="flex justify-center">
                <div
                  className={`rounded-full px-4 py-2 ${
                    data.status === "approved" || data.status === "completed"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {data.status === "approved" || data.status === "completed"
                    ? "✓ Approved"
                    : "✗ Rejected"}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isProcessed && (
              <div className="space-y-4">
                <ActionButtons
                  submitting={submitting}
                  showAlternativeForm={showAlternativeForm}
                  onApprove={() => handleAction("approve")}
                  onReject={() => handleAction("reject")}
                  onShowAlternativeForm={() => setShowAlternativeForm(true)}
                />

                {/* Alternative Schedule Form */}
                {showAlternativeForm && (
                  <AlternativeScheduleForm
                    alternativeDate={alternativeDate}
                    alternativeStartTime={alternativeStartTime}
                    alternativeEndTime={alternativeEndTime}
                    alternativeReason={alternativeReason}
                    submitting={submitting}
                    onDateChange={setAlternativeDate}
                    onStartTimeChange={setAlternativeStartTime}
                    onEndTimeChange={setAlternativeEndTime}
                    onReasonChange={setAlternativeReason}
                    onCancel={() => {
                      setShowAlternativeForm(false);
                      setAlternativeDate("");
                      setAlternativeStartTime("");
                      setAlternativeEndTime("");
                      setAlternativeReason("");
                    }}
                    onSubmit={() => handleAction("reject")}
                  />
                )}
              </div>
            )}

            {/* Contact Info */}
            <div className="mt-8 rounded-lg border border-zinc-700 bg-zinc-900/30 p-4 text-center text-sm text-zinc-400">
              <p>
                If you have any questions, please contact your PIC at{" "}
                {data.appointment.pic?.email ?? "the support team"}.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
