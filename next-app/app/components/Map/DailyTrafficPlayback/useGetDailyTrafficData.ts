"use client";

import { useEffect } from "react";
import { fetchDailyCountsInDateRange } from "@/components/Map/utils/fetchDailyCountsInDateRange";
import { useMapContext } from "@/src/contexts/MapContext";

/**
 * Fetches aggregate daily traffic totals (likely for the Sidebar charts).
 * Optimized to run independently of the Leaflet map instance.
 */
export function useGetDailyTrafficData() {
  const {
    dateRange,
    setDateRangeData,
    setLoadingDailyTrafficData,
  } = useMapContext();

  useEffect(() => {
    const [start, end] = dateRange;

    // 1. Only execute if a valid range exists
    if (start && end) {
      let isMounted = true;

      const fetchData = async () => {
        setLoadingDailyTrafficData(true);
        try {
          // 2. Utility handles the context update for setDateRangeData
          await fetchDailyCountsInDateRange(
            start, 
            end, 
            setDateRangeData, 
            setLoadingDailyTrafficData
          );
        } catch (error) {
          console.error("Historical Daily Fetch failed:", error);
        } finally {
          // 3. Prevent memory leaks/state updates on unmounted components
          if (isMounted) setLoadingDailyTrafficData(false);
        }
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    }
  }, [dateRange, setDateRangeData, setLoadingDailyTrafficData]);
}