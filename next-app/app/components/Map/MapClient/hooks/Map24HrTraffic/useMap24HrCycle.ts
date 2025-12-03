"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { useUpdate24HrTrafficData } from "@/components/Map/MapClient/hooks/Map24HrTraffic/useUpdate24HrTrafficData"
import { useRenderCircleMarkers } from "@/components/Map/MapClient/hooks/Map24HrTraffic/useRenderCircleMarkers"; 
import { use24HrTrafficPlayer } from "@/components/Map/MapClient/hooks/Map24HrTraffic/use24HrTrafficPlayer";

export function useMap24HrCycle(
  dateRange: [Date | null, Date | null],
  timeArray: string[],
  setTimeArray: React.Dispatch<React.SetStateAction<string[]>>,
  counterLocationData: any,
  mapInstance: L.Map | null,
  dataLayerRef: React.MutableRefObject<L.LayerGroup | null>,
  timeIsPlaying: boolean,
  currentTimeIndex: number,
  setCurrentTimeIndex: React.Dispatch<React.SetStateAction<number>>,
  setTimeIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  playIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
  currentTime: string,
  setCurrentTime: React.Dispatch<React.SetStateAction<string>>,
) {
  // Fetch data when year/month changes; coordinates also get attached
  const twentyFourHrCycleData = useUpdate24HrTrafficData(dateRange, counterLocationData);

  // Play 24 hour traffic cycle
  const currtwentyFourHrCycleData = use24HrTrafficPlayer(
    timeIsPlaying,
    timeArray,
    setTimeArray,
    currentTimeIndex,
    twentyFourHrCycleData,
    setCurrentTimeIndex,
    setTimeIsPlaying,
    playIntervalRef,
    currentTime,
    setCurrentTime,
  )

  // Draw markers when data changes
  useRenderCircleMarkers(mapInstance, currtwentyFourHrCycleData, dataLayerRef, currentTime);

}
