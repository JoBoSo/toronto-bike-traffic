"use client";

import { useEffect } from "react";
import { fetchDailyCountsByLocNameInDateRange } from "@/components/Map/utils/fetchDailyCountsByLocNameInDateRange";
import { useMapContext } from "@/src/contexts/MapContext";

/**
 * Fetches daily aggregate traffic data keyed by location name.
 * Optimized to remove Leaflet dependencies, focusing purely on state management.
 */
export function useGetDailyTrafficByLocNameData() {
  const {
    dateRange,
    setDateRangeByLocNameData,
    setLoadingDailyTrafficData,
  } = useMapContext();

  useEffect(() => {
    const [start, end] = dateRange;

    // 1. Only fetch if both dates exist
    if (start && end) {
      let isMounted = true;

      const fetchData = async () => {
        setLoadingDailyTrafficData(true);
        try {
          // 2. We trigger the utility. 
          // Note: Ensure your utility returns the data if you want to use the isMounted check,
          // otherwise, the utility handles the Context update internally.
          await fetchDailyCountsByLocNameInDateRange(
            start, 
            end, 
            setDateRangeByLocNameData, 
            setLoadingDailyTrafficData
          );
        } catch (error) {
          console.error("Daily Traffic Fetch failed:", error);
        } finally {
          // 3. Only update loading state if component is still active
          if (isMounted) setLoadingDailyTrafficData(false);
        }
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    }
  }, [dateRange, setDateRangeByLocNameData, setLoadingDailyTrafficData]);
}