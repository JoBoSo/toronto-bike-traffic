"use client";

import styles from "@/components/Map/MapClient/MapClient.module.scss";
import { useEffect, useRef, useState } from "react";
import L, { Map as LeafletMap, LayerGroup, TileLayer } from "leaflet";
import "react-datepicker/dist/react-datepicker.css";
import "leaflet/dist/leaflet.css";

// Contexts
import { usePageContentContext } from "@/src/contexts/PageContentContext";
import { useMapContext } from "@/src/contexts/MapContext";

// Hooks
import { useInitializeMap } from "@/components/Map/MapClient/hooks/BaseLayers/useInitializeMap";
import { useFitMapToContainer } from "@/components/Map/MapClient/hooks/BaseLayers/useFitMapToContainer";
import { useRenderCounterLocations } from "@/components/Map/MapClient/hooks/BaseLayers/useRenderCounterLocations";
import { useRenderConsolidatedCounterLocations } from "@/components/Map/MapClient/hooks/BaseLayers/useRenderConsolidatedCounterLocations";
import { useRenderCyclingNetwork } from "@/components/Map/MapClient/hooks/BaseLayers/useRenderCyclingNetwork";
import { useControl24HrTrafficPlayer } from "@/components/Map/MapClient/hooks/Play24HrTraffic/useControl24HrTrafficPlayer";
import { useInitTimeArray } from "@/components/Map/MapClient/hooks/Play24HrTraffic/useInitTimeArray"
import { useGet24HrTraffic } from "@/components/Map/MapClient/hooks/Play24HrTraffic/useGet24HrTraffic"
import { useMark24HrTraffic } from "@/components/Map/MapClient/hooks/Play24HrTraffic/useMark24HrTraffic"; 
import { useSetCurr24HrTrafficData } from "@/components/Map/MapClient/hooks/Play24HrTraffic/useSetCurr24HrTrafficData"; 
import { useGetDailyTrafficData } from "@/components/Map/MapClient/hooks/PlayDailyTraffic/useGetDailyTrafficData";
import { useGetDailyTrafficByLocNameData } from "@/components/Map/MapClient/hooks/PlayDailyTraffic/useGetDailyTrafficByLocNameData";
import { useInitDateArray } from "@/components/Map/MapClient/hooks/PlayDailyTraffic/useInitDateArray";
import { useMarkDailyTraffic } from "@/components/Map/MapClient/hooks/PlayDailyTraffic/useMarkDailyTraffic";
import useSetBaseMap from "@/components/Map/MapLayersControl/hooks/useSetBaseMap";
import useToggleBaseMap from "@/components/Map/MapLayersControl/hooks/useToggleBaseMap";
import { useControlDailyTrafficPlayer } from "@/components/Map/MapClient/hooks/PlayDailyTraffic/useControlDailyTrafficPlayer";
import { useSetCurrDayData } from "@/components/Map/MapClient/hooks/PlayDailyTraffic/useSetCurrDayData";
import { useTimeColorOverlay } from "@/components/Map/MapClient/hooks/Play24HrTraffic/useTimeColorOverlay";
import { useGet24HrTrafficByLocName } from '@/components/Map/MapClient/hooks/Play24HrTraffic/useGet24HrTrafficByLocName';

// Components
import MapLayersControl from "@/components/Map/MapLayersControl/MapLayersControl";
import PlaybackInfoOverlay from "@/components/Map/PlaybackInfoOverlay/PlaybackInfoOverlay";
import formatShortDate from "@/src/utils/formatShortDate"

// utils
import { convertTo12HourTime } from "@/src/utils/convertTo12HourTime"

interface MapClientProps {
  isSidebarCollapsed: boolean; 
}

export default function MapClient({ isSidebarCollapsed }: MapClientProps) {
  // Contexts
  const { counterLocations, counterGroups, cyclingNetwork, isLoading } = usePageContentContext();
  const {
    dateRange,
    dateRangeData,
    isPlaying,
    setIsPlaying,
    hr24TrafficData,
    timeIsPlaying, 
    setTimeIsPlaying,
    timeArray,
    setTimeArray,
    dateArray,
    setDateArray,
    currentDateIndex,
    setCurrentDateIndex,
    currentTimeIndex, 
    setCurrentTimeIndex,
    currentTime,
    setCurrentTime,
  } = useMapContext();

  // Map refs & instance
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const dataLayerRef = useRef<LayerGroup | null>(null);

  // Base map layers
  const digitalLayerRef = useRef<TileLayer | null>(null);
  const satelliteLayerRef = useRef<TileLayer | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);

  // Date range & playback
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  //// Base Layers
  useInitializeMap(mapRef, mapInstance, setMapInstance);
  useRenderCyclingNetwork(mapInstance, cyclingNetwork);
  // useRenderCounterLocations(mapInstance, counterLocations);
  useRenderConsolidatedCounterLocations(mapInstance, counterGroups);
  useFitMapToContainer(mapInstance, isSidebarCollapsed);

  //// 24 Hour Traffic Player
  // useGet24HrTraffic(counterLocations);
  useGet24HrTrafficByLocName();
  useInitTimeArray();
  const currHr24CycleData = useSetCurr24HrTrafficData();
  useControl24HrTrafficPlayer(playIntervalRef)
  useMark24HrTraffic(mapInstance, currHr24CycleData, dataLayerRef);
  useTimeColorOverlay(mapInstance);

  //// Daily Traffic Player
  useControlDailyTrafficPlayer(playIntervalRef);
  // useGetDailyTrafficData(mapInstance);
  useGetDailyTrafficByLocNameData(mapInstance);
  const currDayData = useSetCurrDayData();
  useMarkDailyTraffic(mapInstance, currDayData, counterLocations, dataLayerRef);
  useInitDateArray();

  //// Base Map Toggle
  useSetBaseMap(mapInstance, digitalLayerRef, satelliteLayerRef);
  useToggleBaseMap(mapInstance, digitalLayerRef, satelliteLayerRef, isSatellite);

  return (
      <div className={styles["map-client-container"]}>
        <MapLayersControl isSatellite={isSatellite} setIsSatellite={setIsSatellite} />
        {timeIsPlaying && <PlaybackInfoOverlay info={convertTo12HourTime(currentTime)} />}
        {isPlaying && dateArray[currentDateIndex] && <PlaybackInfoOverlay info={formatShortDate(dateArray[currentDateIndex])} />}
        {/* Map Container */}
        <div id="map" ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>
  );
}
