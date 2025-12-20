"use client";

import { useEffect, useState } from "react";
import { useMapContext } from "@/src/contexts/MapContext";

/**
 * Hook to "slice" the 24-hour dataset and parse coordinates for the active frame.
 */
export function useSetCurr24HrTrafficData() { 
  const {
    timeArray,
    currentTimeIndex,
    hr24TrafficByLocNameData,
    setCurrentTime,
  } = useMapContext();

  const [currData, setCurrData] = useState<any[] | null>(null);

  useEffect(() => {
    if (timeArray.length > 0 && hr24TrafficByLocNameData) {
      const time = timeArray[currentTimeIndex];
      setCurrentTime(time);

      const trafficAtTime = hr24TrafficByLocNameData[time] || [];

      // Process and parse coordinates for just this time slice
      const parsedTraffic = trafficAtTime.map((item: any) => {
        // If it's already parsed (from a previous loop), don't do it again
        if (item.lat !== undefined) return item;

        try {
          // Parse [lon, lat] string
          const lonLat = JSON.parse(item.coordinates);
          return {
            ...item,
            lat: lonLat[1],
            lng: lonLat[0],
            latLon: [lonLat[1], lonLat[0]] as [number, number]
          };
        } catch (e) {
          console.error("Coordinate parsing failed for item:", item.location_id);
          return item;
        }
      });
      
      setCurrData(parsedTraffic);
    }
  }, [currentTimeIndex, hr24TrafficByLocNameData, timeArray, setCurrentTime]);

  return currData;
}