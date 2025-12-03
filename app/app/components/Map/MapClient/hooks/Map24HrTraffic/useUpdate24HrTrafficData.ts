"use client";

import { useEffect, useState, useRef } from "react";
import { fetch24HourCycleData } from "../../../utils/fetch24HourCycleData";

// Fetch data when year/month changes
export function useUpdate24HrTrafficData(
  dateRange: [Date | null, Date | null], 
  counterLocationData: any,
) {
  const [data, setData] = useState<any[] | null>(null);
  
  useEffect(() => {
    if (!dateRange[0] || !dateRange[1]) return;

    const fetchData = async () => {
      console.log("fetching 24 hour cycle data for", dateRange);
      const fetchedData: any = await fetch24HourCycleData(dateRange, counterLocationData);
      setData(fetchedData);
    };

    fetchData();
  }, [dateRange, counterLocationData]);

  return data;

}