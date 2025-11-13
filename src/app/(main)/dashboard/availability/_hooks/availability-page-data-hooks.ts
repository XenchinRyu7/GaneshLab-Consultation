/**
 * Data fetching hooks for AvailabilityPage
 */

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

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
export function useAvailabilities(selectedPicId: string | null) {
  const [availabilities, setAvailabilities] = useState<AvailabilityByDay>({});
  const [loading, setLoading] = useState(true);
  const [viewingPicName, setViewingPicName] = useState<string | null>(null);

  async function fetchAvailabilities(picId: string) {
    try {
      setLoading(true);
      const url = picId ? `/api/pic/availability?picId=${picId}` : "/api/pic/availability";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }
      const data = await response.json();
      const initialized = initializeAvailabilityData(data);
      setAvailabilities(initialized);
      setViewingPicName(data.picName ?? null);
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
      fetchAvailabilities(selectedPicId);
    }
  }, [selectedPicId]);

  return { availabilities, loading, viewingPicName, setAvailabilities };
}

/**
 * Hook to handle authorization and initialization
 */
export function useAvailabilityAuthorization() {
  const router = useRouter();
  const currentUser = useUserStore(state => state.currentUser);
  const [selectedPicId, setSelectedPicId] = useState<string | null>(() => currentUser?.id ?? null);
  const isViewingOwnSchedule = selectedPicId === currentUser?.id;

  useEffect(() => {
    if (currentUser && currentUser.role !== "pic") {
      toast.error("Only PIC can access this page");
      router.push("/dashboard");
      return;
    }
  }, [currentUser, router]);

  // Initialize selectedPicId when currentUser becomes available
  useEffect(() => {
    if (currentUser?.id && !selectedPicId) {
      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        setSelectedPicId(currentUser.id);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [currentUser?.id, selectedPicId]);

  return { currentUser, selectedPicId, setSelectedPicId, isViewingOwnSchedule };
}
