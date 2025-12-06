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
import { useRenderCounterLocations } from "@/components/Map/MapClient/hooks/BaseLayers/useRenderCounterLocations";
import { useRenderCyclingNetwork } from "@/components/Map/MapClient/hooks/BaseLayers/useRenderCyclingNetwork";
import { useControl24HrTrafficPlayer } from "@/components/Map/MapClient/hooks/Play24HrTraffic/useControl24HrTrafficPlayer";
import { useGet24HrTraffic } from "@/components/Map/MapClient/hooks/Play24HrTraffic/useGet24HrTraffic"
import { useMark24HrTraffic } from "@/components/Map/MapClient/hooks/Play24HrTraffic/useMark24HrTraffic"; 
import { useSetCurr24HrTrafficData } from "@/components/Map/MapClient/hooks/Play24HrTraffic/useSetCurr24HrTrafficData"; 
import { useGetDailyTrafficData } from "@/components/Map/MapClient/hooks/PlayDailyTraffic/useGetDailyTrafficData";
import { useInitDateArray } from "@/components/Map/MapClient/hooks/PlayDailyTraffic/useInitDateArray";
import { useMarkDailyTraffic } from "@/components/Map/MapClient/hooks/PlayDailyTraffic/useMarkDailyTraffic";
import useSetBaseMap from "@/components/Map/MapLayersControl/hooks/useSetBaseMap";
import useToggleBaseMap from "@/components/Map/MapLayersControl/hooks/useToggleBaseMap";
import { useControlDailyTrafficPlayer } from "./hooks/PlayDailyTraffic/useControlDailyTrafficPlayer";
import { useSetCurrDayData } from "./hooks/PlayDailyTraffic/useSetCurrDayData";

// utils
import generate15MinIntervals from "@/components/Map/utils/generate15MinIntervals"

// Components
import MapLayersControl from "@/components/Map/MapLayersControl/MapLayersControl";

export default function MapClient() {
  // Contexts
  const { counterLocations, cyclingNetwork, isLoading } = usePageContentContext();
  const {
    dateRange,
    dateRangeData,
    setDateRangeData,
    isPlaying,
    setIsPlaying,
    hr24TrafficData,
    setHr24TrafficData,
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
  useRenderCounterLocations(mapInstance, counterLocations);

  //// 24 Hour Traffic Player
  useGet24HrTraffic(dateRange, counterLocations, setHr24TrafficData);
  const currHr24CycleData = useSetCurr24HrTrafficData(
    timeArray, currentTimeIndex, hr24TrafficData, setCurrentTime
  );
  useControl24HrTrafficPlayer(
    timeIsPlaying,
    setTimeIsPlaying,
    timeArray,
    setTimeArray,
    currentTimeIndex,
    setCurrentTimeIndex,
    hr24TrafficData,
    playIntervalRef
  )
  useMark24HrTraffic(mapInstance, currHr24CycleData, dataLayerRef, currentTime);

  //// Daily Traffic Player
  useControlDailyTrafficPlayer(
    isPlaying, currentDateIndex, dateArray, setCurrentDateIndex, setIsPlaying, playIntervalRef
  );
  useGetDailyTrafficData(mapInstance, dateRange, setDateRangeData);
  const currDayData = useSetCurrDayData(dateRangeData, currentDateIndex);
  useMarkDailyTraffic(mapInstance, currDayData, counterLocations, dataLayerRef);
  useInitDateArray(dateRange, setDateArray, setCurrentDateIndex);

  //// Base Map Toggle
  useSetBaseMap(mapInstance, digitalLayerRef, satelliteLayerRef);
  useToggleBaseMap(mapInstance, digitalLayerRef, satelliteLayerRef, isSatellite);

  return (
      <div className={styles["map-client-container"]}>
        {/* Map Layers Control */}
        <MapLayersControl isSatellite={isSatellite} setIsSatellite={setIsSatellite} />

        {/* Map Container */}
        <div id="map" ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>
  );
}
