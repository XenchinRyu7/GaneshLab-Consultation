/**
 * Data fetching hooks for AvailabilityPage
 */

import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";

import { useRouter } from "@/i18n/routing";
import { useUserStore } from "@/stores/user/user-provider";

import {
  type AvailabilityByDay,
  createEmptyAvailabilityData,
  initializeAvailabilityData,
} from "./availability-page-hooks";

interface PIC {
  id: string;
  fullname: string;
  email: string;
  avatarColor?: string | null;
}

/**
 * Hook to handle PIC fetching
 */
export function usePICs() {
  const [pics, setPics] = useState<PIC[]>([]);

  const fetchPICs = useCallback(async () => {
    try {
      const response = await fetch("/api/projects/pics");
      if (!response.ok) {
        throw new Error("Failed to fetch PICs");
      }
      const data = await response.json();
      setPics(data.pics ?? []);
    } catch (error) {
      console.error("Error fetching PICs:", error);
      toast.error("Failed to load PICs");
    }
  }, []);

  return { pics, fetchPICs };
}

/**
 * Hook to handle availability fetching
 */
export function useAvailabilities(selectedPicId: string | null, weekStart?: Date) {
  const [availabilities, setAvailabilities] = useState<AvailabilityByDay>({});
  const [loading, setLoading] = useState(true);
  const [viewingPicName, setViewingPicName] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<string | null>(null);

  async function fetchAvailabilities(picId: string, weekStartDate?: Date) {
    try {
      setLoading(true);
      let url = picId ? `/api/pic/availability?picId=${picId}` : "/api/pic/availability";

      if (weekStartDate) {
        // Use local date components to avoid timezone issues
        // toISOString() converts to UTC which can change the date
        const year = weekStartDate.getFullYear();
        const month = String(weekStartDate.getMonth() + 1).padStart(2, "0");
        const day = String(weekStartDate.getDate()).padStart(2, "0");
        const weekStartStr = `${year}-${month}-${day}`;
        url += `${picId ? "&" : "?"}weekStart=${weekStartStr}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }
      const data = await response.json();
      const initialized = initializeAvailabilityData(data);
      setAvailabilities(initialized);
      setViewingPicName(data.picName ?? null);
      setCurrentWeekStart(data.weekStart ?? null);
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load availability schedule");
      setAvailabilities(createEmptyAvailabilityData());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedPicId) {
      fetchAvailabilities(selectedPicId, weekStart);
    }
  }, [selectedPicId, weekStart]);

  return {
    availabilities,
    loading,
    viewingPicName,
    currentWeekStart,
    setAvailabilities,
    refetch: () => fetchAvailabilities(selectedPicId ?? "", weekStart),
  };
}

/**
 * Hook to handle authorization and initialization
 */
export function useAvailabilityAuthorization() {
  const router = useRouter();
  const currentUser = useUserStore(state => state.currentUser);
  const isViewingOwnSchedule = true;

  useEffect(() => {
    if (currentUser && currentUser.role !== "pic" && currentUser.role !== "admin") {
      toast.error("Only PIC and Admin can access this page");
      router.push("/dashboard");
      return;
    }
  }, [currentUser, router]);

  return { currentUser, isViewingOwnSchedule };
}
