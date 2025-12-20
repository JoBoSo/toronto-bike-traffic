"use client";

import { useEffect } from "react";
import generate15MinIntervals from "@/components/Map/utils/generate15MinIntervals";
import { useMapContext } from "@/src/contexts/MapContext";

/**
 * Hook to initialize the timeArray state (15-minute intervals for a 24-hour cycle).
 * This acts as the "clock face" for the traffic playback.
 */
export function useInitTimeArray() {
  const {
    timeArray,
    setTimeArray,
  } = useMapContext();

  useEffect(() => {
    // We only want to generate these intervals if they don't exist yet.
    // Using a simple length check is sufficient.
    if (timeArray.length === 0) {
      console.log("Initializing 24-hour time array intervals.");
      const intervals = generate15MinIntervals();
      setTimeArray(intervals);
    }
  }, [setTimeArray, timeArray.length]); 
}