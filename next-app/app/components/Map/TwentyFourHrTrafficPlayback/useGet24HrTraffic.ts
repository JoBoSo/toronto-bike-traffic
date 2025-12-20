"use client";

import { useEffect } from "react";
import { fetch24HourCycleData } from "@/components/Map/utils/fetch24HourCycleData";
import { useMapContext } from "@/src/contexts/MapContext";

/**
 * Hook to fetch aggregate 24-hour cycle data when the date range 
 * or the counter location list changes.
 */
export function useGet24HrTraffic(counterLocationData: any) {
  const {
    dateRange,
    setHr24TrafficData,
    setLoadingHr24TrafficData,
  } = useMapContext();

  useEffect(() => {
    // 1. Guard: Ensure dates and counter locations exist
    if (!dateRange[0] || !dateRange[1] || !counterLocationData) return;

    let isMounted = true;

    const fetchData = async () => {
      setLoadingHr24TrafficData(true);
      try {
        // 2. We call the utility. It updates the Context.
        // We handle the return value in case you need it locally,
        // but primarily we rely on setHr24TrafficData inside the util.
        await fetch24HourCycleData(
          dateRange, 
          counterLocationData, 
          setHr24TrafficData, 
          setLoadingHr24TrafficData
        );
      } catch (error) {
        console.error("Failed to fetch 24-hour cycle data:", error);
      } finally {
        if (isMounted) setLoadingHr24TrafficData(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [dateRange, counterLocationData, setHr24TrafficData, setLoadingHr24TrafficData]);
}