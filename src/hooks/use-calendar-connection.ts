import { useState, useEffect } from "react";

import { toast } from "sonner";

interface CalendarConnection {
  isConnected: boolean;
  isLoading: boolean;
  connect: () => void;
  disconnect: () => void;
}

export function useCalendarConnection(): CalendarConnection {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch("/api/calendar/status");
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
      }
    } catch (error) {
      console.error("Error checking calendar status:", error);
    }
  };

  const connect = () => {
    setIsLoading(true);
    // Redirect to Google OAuth
    window.location.href = "/api/calendar/connect";
  };

  const disconnect = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/calendar/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        setIsConnected(false);
        toast.success("Calendar disconnected successfully");
      } else {
        throw new Error("Failed to disconnect calendar");
      }
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      toast.error("Failed to disconnect calendar");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isConnected,
    isLoading,
    connect,
    disconnect,
  };
}
