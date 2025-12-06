import { useEffect } from "react";
// Assuming this utility is available at this path
import generate15MinIntervals from "@/components/Map/utils/generate15MinIntervals";
import React from "react";

/**
 * Hook to initialize the timeArray state (15-minute intervals for a 24-hour cycle)
 * only once when the component mounts.
 */
export function useInitTimeArray(
  timeArray: string[],
  setTimeArray: React.Dispatch<React.SetStateAction<string[]>>
) {
  useEffect(() => {
    // Only run initialization if the array is currently empty
    if (timeArray.length === 0) {
      console.log("Initializing 24-hour time array intervals.");
      const intervals = generate15MinIntervals();
      setTimeArray(intervals);
    }
  }, [timeArray, setTimeArray]);
}