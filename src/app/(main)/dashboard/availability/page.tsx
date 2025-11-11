"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user/user-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimePicker } from "@/components/ui/time-picker";
import { toast } from "sonner";
import { Loader2, Clock, Calendar, Plus, Trash2, Users, Monitor, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  meetingType: "online" | "offline";
}

interface AvailabilityByDay {
  [key: string]: AvailabilitySlot[];
}

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

interface PIC {
  id: string;
  fullname: string;
  email: string;
  avatarColor?: string | null;
}

export default function AvailabilityPage() {
  const router = useRouter();
  const currentUser = useUserStore((state) => state.currentUser);
  const [availabilities, setAvailabilities] = useState<AvailabilityByDay>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPicId, setSelectedPicId] = useState<string | null>(null);
  const [pics, setPics] = useState<PIC[]>([]);
  const [viewingPicName, setViewingPicName] = useState<string | null>(null);
  const [isViewingOwnSchedule, setIsViewingOwnSchedule] = useState(true);

  useEffect(() => {
    // Check if user is PIC
    if (currentUser && currentUser.role !== "pic") {
      toast.error("Only PIC can access this page");
      router.push("/dashboard");
      return;
    }

    if (currentUser) {
      fetchPICs();
      setSelectedPicId(currentUser.id);
      setIsViewingOwnSchedule(true);
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (selectedPicId) {
      fetchAvailabilities(selectedPicId);
      setIsViewingOwnSchedule(selectedPicId === currentUser?.id);
    }
  }, [selectedPicId, currentUser]);

  async function fetchPICs() {
    try {
      const response = await fetch("/api/projects/pics");
      if (!response.ok) {
        throw new Error("Failed to fetch PICs");
      }
      const data = await response.json();
      setPics(data.pics || []);
    } catch (error) {
      console.error("Error fetching PICs:", error);
      toast.error("Failed to load PICs");
    }
  }

  async function fetchAvailabilities(picId: string) {
    try {
      setLoading(true);
      const url = picId ? `/api/pic/availability?picId=${picId}` : "/api/pic/availability";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }
      const data = await response.json();
      
      // Initialize all days with empty arrays
      const initialized: AvailabilityByDay = {};
      DAYS_OF_WEEK.forEach((day) => {
        initialized[day.value] = data.availabilities[day.value] || [];
      });
      
      setAvailabilities(initialized);
      setViewingPicName(data.picName || null);
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load availability schedule");
      // Initialize with empty arrays on error
      const empty: AvailabilityByDay = {};
      DAYS_OF_WEEK.forEach((day) => {
        empty[day.value] = [];
      });
      setAvailabilities(empty);
    } finally {
      setLoading(false);
    }
  }

  function addSlot(dayOfWeek: string) {
    setAvailabilities((prev) => ({
      ...prev,
      [dayOfWeek]: [
        ...(prev[dayOfWeek] || []),
        {
          dayOfWeek,
          startTime: "09:00",
          endTime: "17:00",
          meetingType: "online",
        },
      ],
    }));
  }

  function removeSlot(dayOfWeek: string, index: number) {
    setAvailabilities((prev) => ({
      ...prev,
      [dayOfWeek]: prev[dayOfWeek].filter((_, i) => i !== index),
    }));
  }

  function updateSlot(
    dayOfWeek: string,
    index: number,
    field: "startTime" | "endTime" | "meetingType",
    value: string
  ) {
    setAvailabilities((prev) => ({
      ...prev,
      [dayOfWeek]: prev[dayOfWeek].map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      const response = await fetch("/api/pic/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availabilities }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save availability");
      }

      const data = await response.json();
      setAvailabilities(data.availabilities);
      toast.success("Availability schedule saved successfully");
    } catch (error: any) {
      console.error("Error saving availability:", error);
      toast.error(error.message || "Failed to save availability schedule");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "pic") {
    return null;
  }

  // Get color classes for meeting types
  const getMeetingTypeColors = (meetingType: "online" | "offline") => {
    if (meetingType === "online") {
      return "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800";
    } else {
      return "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800";
    }
  };

  const getMeetingTypeIcon = (meetingType: "online" | "offline") => {
    if (meetingType === "online") {
      return <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    } else {
      return <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
    }
  };

  const getMeetingTypeBadge = (meetingType: "online" | "offline") => {
    if (meetingType === "online") {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700">
          Online
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700">
          Offline
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Availability Schedule</h1>
          <p className="text-muted-foreground mt-2">
            {isViewingOwnSchedule 
              ? "Set your weekly working hours with multiple time slots per day. Each slot can be online or offline."
              : `Viewing ${viewingPicName || "PIC"}'s schedule. You can view other PICs' schedules to coordinate meetings.`
            }
          </p>
        </div>
        {pics.length > 0 && (
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <Select
              value={selectedPicId || ""}
              onValueChange={(value) => setSelectedPicId(value)}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select PIC" />
              </SelectTrigger>
              <SelectContent>
                {pics.map((pic) => (
                  <SelectItem key={pic.id} value={pic.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback 
                          className="text-xs text-white"
                          style={{ backgroundColor: pic.avatarColor || "#3b82f6" }}
                        >
                          {getInitials(pic.fullname)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{pic.fullname}</span>
                      {pic.id === currentUser?.id && (
                        <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule {viewingPicName && !isViewingOwnSchedule && `- ${viewingPicName}`}
          </CardTitle>
          <CardDescription>
            {isViewingOwnSchedule 
              ? "Configure your availability for each day of the week. You can add multiple time slots per day with different meeting types (online/offline)."
              : `Viewing ${viewingPicName || "PIC"}'s availability schedule. Card colors indicate meeting type: Blue for Online, Orange for Offline.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {DAYS_OF_WEEK.map((day) => {
              const slots = availabilities[day.value] || [];

              return (
                <div
                  key={day.value}
                  className="p-4 border rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-lg">{day.label}</div>
                    {isViewingOwnSchedule && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSlot(day.value)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Slot
                      </Button>
                    )}
                  </div>

                  {slots.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No time slots added. Click "Add Slot" to add availability.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {slots.map((slot, index) => (
                        <div
                          key={index}
                          className={`flex flex-col sm:flex-row gap-4 p-4 rounded-lg border-2 transition-colors ${getMeetingTypeColors(slot.meetingType)}`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              {getMeetingTypeIcon(slot.meetingType)}
                              {getMeetingTypeBadge(slot.meetingType)}
                            </div>
                            {isViewingOwnSchedule ? (
                              <>
                                <div className="flex items-center gap-2 flex-1">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <Label className="text-sm w-20">
                                    Start Time
                                  </Label>
                                  <TimePicker
                                    value={slot.startTime}
                                    onChange={(value) =>
                                      updateSlot(day.value, index, "startTime", value)
                                    }
                                    id={`${day.value}-${index}-start`}
                                  />
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                  <Label className="text-sm w-20">
                                    End Time
                                  </Label>
                                  <TimePicker
                                    value={slot.endTime}
                                    onChange={(value) =>
                                      updateSlot(day.value, index, "endTime", value)
                                    }
                                    id={`${day.value}-${index}-end`}
                                  />
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                  <Label htmlFor={`${day.value}-${index}-type`} className="text-sm w-20">
                                    Type
                                  </Label>
                                  <Select
                                    value={slot.meetingType}
                                    onValueChange={(value) =>
                                      updateSlot(day.value, index, "meetingType", value)
                                    }
                                  >
                                    <SelectTrigger className="w-32" id={`${day.value}-${index}-type`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="online">Online</SelectItem>
                                      <SelectItem value="offline">Offline</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSlot(day.value, index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <div className="flex items-center gap-4 flex-1 ml-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isViewingOwnSchedule && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Schedule"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
