"use client";

import { useEffect, useState, useMemo } from "react";
import { DailyLocationCount } from "@/src/interfaces/flaskApiResponseTypes/DailyCountsByLocNameInDateRangeResponse";
import { useMapContext } from "@/src/contexts/MapContext";

export function useSetCurrDayData(): DailyLocationCount[] | null {
  const {
    dateRangeByLocNameData,
    currentDateIndex,
  } = useMapContext();

  const [currDateData, setCurrDateData] = useState<DailyLocationCount[] | null>(null);

  // 1. Optimization: Memoize sorted keys so we don't re-sort every frame
  const chronologicalDateKeys = useMemo(() => {
    if (!dateRangeByLocNameData) return [];
    
    return Object.keys(dateRangeByLocNameData).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
  }, [dateRangeByLocNameData]);

  useEffect(() => {
    if (!dateRangeByLocNameData || currentDateIndex < 0 || chronologicalDateKeys.length === 0) {
      setCurrDateData(null);
      return;
    }

    if (currentDateIndex >= chronologicalDateKeys.length) {
      setCurrDateData(null);
      return;
    }

    const currDateKey = chronologicalDateKeys[currentDateIndex];
    const rawVolumes = dateRangeByLocNameData[currDateKey] || [];

    // 2. Optimization: Pre-parse coordinates and flatten for Leaflet
    const processedVolumes = rawVolumes.map((item: any) => {
      // If we've already processed this specific object in a previous tick, return it
      if (item.latLon) return item;

      try {
        const lonLat = typeof item.coordinates === 'string' 
          ? JSON.parse(item.coordinates) 
          : item.coordinates;

        return {
          ...item,
          // rename to latLon and format as [lat, lon] for Leaflet
          latLon: [lonLat[1], lonLat[0]] as [number, number]
        };
      } catch (e) {
        console.error(`Error parsing coordinates for location ${item.name}`, e);
        return item;
      }
    });

    setCurrDateData(processedVolumes);

  }, [dateRangeByLocNameData, currentDateIndex, chronologicalDateKeys]);

  return currDateData;
}