/**
 * Component to display reschedule notifications for clients
 * Shows when PIC has rescheduled appointments (no approval needed)
 */

import { useCallback, useEffect, useState } from "react";

import { Calendar, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RescheduleRequest {
  id: string;
  appointmentId: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  reason?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
  appointment: {
    title: string;
    pic: {
      fullname: string;
    };
  };
}

interface RescheduleRequestsProps {
  clientId: string;
}

export function RescheduleRequests({ clientId }: RescheduleRequestsProps) {
  const [requests, setRequests] = useState<RescheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/appointments/reschedule?clientId=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests ?? []);
      }
    } catch (error) {
      console.error("Error fetching reschedule requests:", error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleResponse = async (requestId: string, action: "approve" | "reject") => {
    try {
      setProcessing(requestId);
      const response = await fetch(`/api/appointments/reschedule/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Update local state
        setRequests(prev =>
          prev.map(req =>
            req.id === requestId
              ? { ...req, status: action === "approve" ? "approved" : "rejected" }
              : req
          )
        );
      }
    } catch (error) {
      console.error("Error responding to reschedule request:", error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading reschedule requests...</span>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return null;
  }

  const pendingRequests = requests.filter(req => req.status === "pending");

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Reschedule Requests</h3>

      {pendingRequests.map(request => (
        <Card key={request.id} className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Calendar className="h-5 w-5" />
              Reschedule Request for &quot;{request.appointment.title}&quot;
            </CardTitle>
            <CardDescription className="text-orange-700">
              {request.appointment.pic.fullname} has requested to reschedule this appointment
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-white p-4 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">New Date</p>
                  <p className="text-sm text-gray-600">
                    {new Date(request.newDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">New Time</p>
                  <p className="text-sm text-gray-600">
                    {request.newStartTime} - {request.newEndTime}
                  </p>
                </div>
              </div>

              {request.reason && (
                <div>
                  <p className="text-sm font-medium">Reason</p>
                  <p className="text-sm text-gray-600">{request.reason}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleResponse(request.id, "approve")}
                disabled={processing === request.id}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing === request.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Approve
              </Button>

              <Button
                onClick={() => handleResponse(request.id, "reject")}
                disabled={processing === request.id}
                variant="destructive"
              >
                {processing === request.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
