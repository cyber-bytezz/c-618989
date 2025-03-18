
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

/**
 * Custom hook for real-time data fetching with configurable polling
 */
export function useRealTimeData<T>(
  queryKey: string[],
  fetchFn: () => Promise<T>,
  options?: {
    enabled?: boolean;
    pollingInterval?: number;
    initialData?: T;
    onSuccess?: (data: T) => void;
  }
) {
  const [isPaused, setIsPaused] = useState(false);
  
  const { 
    enabled = true, 
    pollingInterval = 60000, // Default to 1 minute polling
    initialData,
    onSuccess
  } = options || {};

  const query = useQuery({
    queryKey,
    queryFn: fetchFn,
    refetchInterval: isPaused ? false : pollingInterval,
    enabled,
    initialData,
    refetchOnWindowFocus: true,
    staleTime: pollingInterval / 2,
    onSuccess,
  });

  // Allow manually pausing/resuming polling
  const togglePolling = () => setIsPaused(prev => !prev);
  const resumePolling = () => setIsPaused(false);
  const pausePolling = () => setIsPaused(true);

  // Automatically pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return {
    ...query,
    isPaused,
    togglePolling,
    resumePolling,
    pausePolling,
    pollingStatus: isPaused ? "paused" : "active"
  };
}
