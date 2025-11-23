/**
 * Component to display Google Calendar connection status for PICs
 */

import { useEffect, useState } from "react";

import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface GoogleCalendarStatusProps {
  picId: string;
}

export function GoogleCalendarStatus({ picId }: GoogleCalendarStatusProps) {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkCalendarStatus();
  }, [picId]);

  const checkCalendarStatus = async () => {
    try {
      setChecking(true);
      const response = await fetch(`/api/calendar/status?userId=${picId}`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data.connected ? "connected" : "disconnected");
      } else {
        setStatus("disconnected");
      }
    } catch (error) {
      console.error("Error checking calendar status:", error);
      setStatus("disconnected");
    } finally {
      setChecking(false);
    }
  };

  const handleConnect = () => {
    // Redirect to Google OAuth
    window.location.href = "/api/calendar/connect";
  };

  if (status === "loading") {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking Google Calendar Status</AlertTitle>
        <AlertDescription>
          Please wait while we check your Google Calendar connection...
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "connected") {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Google Calendar Connected</AlertTitle>
        <AlertDescription className="text-green-700">
          Your Google Calendar is connected. Online appointments will automatically generate Google
          Meet links.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Google Calendar Not Connected</AlertTitle>
      <AlertDescription className="text-orange-700">
        <div className="space-y-2">
          <p>
            Connect your Google Calendar to automatically generate Google Meet links for online
            appointments. Without this connection, online appointments cannot be created.
          </p>
          <Button
            onClick={handleConnect}
            disabled={checking}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            {checking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Google Calendar"
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
