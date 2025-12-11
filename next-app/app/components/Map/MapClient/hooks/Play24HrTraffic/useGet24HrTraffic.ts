"use client";

import { useEffect, useState, useRef } from "react";
import { fetch24HourCycleData } from "@/components/Map/utils/fetch24HourCycleData";
import { useMapContext } from "@/src/contexts/MapContext";

// Fetch data when year/month changes
export function useGet24HrTraffic(
  counterLocationData: any,
) {
  const {
    dateRange,
    setHr24TrafficData,
    setLoadingHr24TrafficData,
  } = useMapContext();

  const [data, setData] = useState<any[] | null>(null);
  
  useEffect(() => {
    if (!dateRange[0] || !dateRange[1]) return;

    const fetchData = async () => {
      console.log("fetching 24 hour cycle data for", dateRange);
      const fetchedData: any = await fetch24HourCycleData(dateRange, counterLocationData, setHr24TrafficData, setLoadingHr24TrafficData);
      setData(fetchedData);
    };

    fetchData();
  }, [dateRange, counterLocationData]);

  return data;

}