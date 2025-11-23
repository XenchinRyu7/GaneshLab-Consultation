"use client";

import { useEffect } from "react";

import { Calendar, CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCalendarConnection } from "@/hooks/use-calendar-connection";

export function CalendarConnection() {
  const { isConnected, isLoading, connect, disconnect } = useCalendarConnection();

  // Handle success/error messages from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const error = urlParams.get("error");

    if (success === "calendar_connected") {
      toast.success("Google Calendar connected successfully!");
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (error) {
      const errorMessages: Record<string, string> = {
        google_auth_failed: "Google authentication failed",
        no_code: "Authorization code not received",
        invalid_tokens: "Invalid tokens received from Google",
        callback_error: "Failed to process Google callback",
      };
      toast.error(errorMessages[error] || "Failed to connect calendar");
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          Connect your Google Calendar to receive appointment notifications and reminders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <CalendarCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Calendar className="text-muted-foreground h-5 w-5" />
            )}
            <div>
              <p className="font-medium">
                {isConnected ? "Calendar Connected" : "Calendar Not Connected"}
              </p>
              <p className="text-muted-foreground text-sm">
                {isConnected
                  ? "You will receive appointment notifications in your Google Calendar"
                  : "Connect your Google Calendar to get notified about appointments"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isConnected ? (
              <Button onClick={connect} disabled={isLoading} className="flex items-center gap-2">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <Calendar className="h-4 w-4" />
                Connect Calendar
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={disconnect}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Disconnect Calendar
              </Button>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg border p-3">
            <p className="text-muted-foreground text-sm">
              <strong>Note:</strong> Connecting your calendar allows Ganeshlab to create events for
              your appointments with reminders. Your calendar data remains private and secure.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
