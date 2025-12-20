"use client";

import { useEffect, useRef } from 'react';
import { generateDateRange } from "@/components/Map/utils/generateDateRange";
import { useMapContext } from "@/src/contexts/MapContext";

/**
 * Initializes and updates the array of dates used for daily playback.
 * Optimizes by preventing redundant calculations and resetting the index 
 * only when the date range strictly changes.
 */
export function useInitDateArray() {
  const {
    dateRange,
    setDateArray,
    setCurrentDateIndex,
  } = useMapContext();

  // Track previous range to avoid resetting index if the same range is passed
  const prevRangeRef = useRef<string>("");

  useEffect(() => {
    const [start, end] = dateRange;
    if (!start || !end) return;

    // Create a string key to check for actual value changes
    const rangeKey = `${start.toString()}-${end.toString()}`;

    if (rangeKey !== prevRangeRef.current) {
      console.log("Updating date array for range:", rangeKey);
      
      const dates = generateDateRange(start, end);
      
      setDateArray(dates);
      
      // Reset the "playhead" to the start of the new range
      setCurrentDateIndex(0);
      
      // Update ref
      prevRangeRef.current = rangeKey;
    }
  }, [dateRange, setDateArray, setCurrentDateIndex]);
}