import { useEffect } from "react";
import generate15MinIntervals from "@/components/Map/utils/generate15MinIntervals";
import { useMapContext } from "@/src/contexts/MapContext";

/**
 * Hook to initialize the timeArray state (15-minute intervals for a 24-hour cycle)
 * only once when the component mounts.
 */
export function useInitTimeArray() {
  const {
    timeArray,
    setTimeArray,
  } = useMapContext();

  useEffect(() => {
    // Only run initialization if the array is currently empty
    if (timeArray.length === 0) {
      console.log("Initializing 24-hour time array intervals.");
      const intervals = generate15MinIntervals();
      setTimeArray(intervals);
    }
  }, [timeArray, setTimeArray]);
}