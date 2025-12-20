"use client";

import { useEffect, useState } from "react";
import { fetch24HrTrafficByLocNameData } from "@/components/Map/utils/fetch24HrTrafficByLocNameData";
import { useMapContext } from "@/src/contexts/MapContext";

/**
 * Hook to orchestrate the fetching of 24-hour traffic data based on a date range.
 * This updates the global MapContext which other map layers consume.
 */
export function useGet24HrTrafficByLocName() {
  const {
    dateRange,
    setLoadingHr24TrafficData,
    setHr24TrafficByLocNameData,
  } = useMapContext();

  useEffect(() => {
    if (!dateRange[0] || !dateRange[1]) return;

    let isMounted = true;

    const fetchData = async () => {
      setLoadingHr24TrafficData(true);
      try {
        // We call the utility. It updates the Context. 
        // Any component listening to useMapContext() will automatically re-render.
        await fetch24HrTrafficByLocNameData(
          dateRange, 
          setHr24TrafficByLocNameData, 
          setLoadingHr24TrafficData
        );
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        if (isMounted) setLoadingHr24TrafficData(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [dateRange]);

}