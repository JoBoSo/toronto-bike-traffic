"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { useGet24HrTraffic } from "@/components/Map/MapClient/hooks/Play24HrTraffic/useGet24HrTraffic"
import { useMark24HrTraffic } from "@/components/Map/MapClient/hooks/Play24HrTraffic/useMark24HrTraffic"; 
import { useControl24HrTrafficPlayer } from "@/components/Map/MapClient/hooks/Play24HrTraffic/useControl24HrTrafficPlayer";

export function usePlay24HrTraffic(
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
  const twentyFourHrCycleData = useGet24HrTraffic(dateRange, counterLocationData);

  // Play 24 hour traffic cycle
  const currtwentyFourHrCycleData = useControl24HrTrafficPlayer(
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
  useMark24HrTraffic(mapInstance, currtwentyFourHrCycleData, dataLayerRef, currentTime);

}
