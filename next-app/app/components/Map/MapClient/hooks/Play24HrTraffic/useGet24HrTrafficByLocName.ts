"use client";

import { useEffect, useState, useRef } from "react";
import { fetch24HrTrafficByLocNameData } from "@/components/Map/utils/fetch24HrTrafficByLocNameData";
import { useMapContext } from "@/src/contexts/MapContext";

export function useGet24HrTrafficByLocName() {
  const {
    dateRange,
    setLoadingHr24TrafficData,
    setHr24TrafficByLocNameData,
  } = useMapContext();

  const [data, setData] = useState<any[] | null>(null);
  
  useEffect(() => {
    if (!dateRange[0] || !dateRange[1]) return;

    const fetchData = async () => {
      const fetchedData: any = await fetch24HrTrafficByLocNameData(
        dateRange, setHr24TrafficByLocNameData, setLoadingHr24TrafficData
      );
      setData(fetchedData);
    };

    fetchData();
  }, [dateRange]);

  return data;
}