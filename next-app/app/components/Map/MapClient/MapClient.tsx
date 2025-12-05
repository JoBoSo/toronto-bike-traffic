"use client";

import styles from "@/components/Map/MapClient/MapClient.module.scss";
import { useEffect, useRef, useState } from "react";
import L, { Map as LeafletMap, LayerGroup, TileLayer } from "leaflet";
import "react-datepicker/dist/react-datepicker.css";
import "leaflet/dist/leaflet.css";

// Contexts
import { usePageContentContext } from "@/src/contexts/PageContentContext";
import { useMapContext } from "@/components/Map/contexts/MapContext";

// Hooks
import { useInitializeMap } from "@/components/Map/MapClient/hooks/BaseLayers/useInitializeMap";
import { useInitDateArray } from "@/components/Map/MapClient/hooks/PlayDailyTraffic/useInitDateArray";
import { useRenderCyclingNetwork } from "@/components/Map/MapClient/hooks/BaseLayers/useRenderCyclingNetwork";
import { useControlDailyTrafficPlayer } from "./hooks/PlayDailyTraffic/useControlDailyTrafficPlayer";
import { useSetCurrDayData } from "./hooks/PlayDailyTraffic/useSetCurrDayData";
import { useRenderCounterLocations } from "@/components/Map/MapClient/hooks/BaseLayers/useRenderCounterLocations";
import { useMarkDailyTraffic } from "@/components/Map/MapClient/hooks/PlayDailyTraffic/useMarkDailyTraffic";
import { useGetDailyTrafficData } from "@/components/Map/MapClient/hooks/PlayDailyTraffic/useGetDailyTrafficData";
import { usePlay24HrTraffic } from "@/components/Map/MapClient/hooks/Play24HrTraffic/usePlay24HrTraffic";
import useSetBaseMap from "@/components/Map/MapLayersControl/hooks/useSetBaseMap";
import useToggleBaseMap from "@/components/Map/MapLayersControl/hooks/useToggleBaseMap";

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
  usePlay24HrTraffic(
    dateRange, timeArray, setTimeArray, counterLocations, mapInstance, dataLayerRef, 
    timeIsPlaying, currentTimeIndex, setCurrentTimeIndex, setTimeIsPlaying,
    playIntervalRef, currentTime, setCurrentTime
  );

  //// Daily Traffic Player
  useControlDailyTrafficPlayer(
    isPlaying, currentDateIndex, dateArray,
    setCurrentDateIndex, setIsPlaying, playIntervalRef
  );
  useGetDailyTrafficData(mapInstance, dateRange, setDateRangeData);
  const currDateData = useSetCurrDayData(dateRangeData, currentDateIndex);
  useMarkDailyTraffic(mapInstance, currDateData, counterLocations, dataLayerRef);
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
