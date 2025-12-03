"use client";

import styles from "./MapClient.module.scss";
import { useEffect, useRef, useState } from "react";
import L, { Map as LeafletMap, LayerGroup, TileLayer } from "leaflet";
import "react-datepicker/dist/react-datepicker.css";
import "leaflet/dist/leaflet.css";

// Contexts
import { useMapContext } from "../contexts/MapContext";

// Utils
import { generateDateRange } from "../utils/generateDateRange";

// Hooks
import { useInitializeMap } from "./hooks/BaseLayers/useInitializeMap";
import { useUpdateDateArray } from "./hooks/MapDailyTraffic/useUpdateDateArray";
import { useRenderCyclingNetwork } from "./hooks/BaseLayers/useRenderCyclingNetwork";
import { useDatePlayer } from "./hooks/MapDailyTraffic/useDatePlayer";
import { useRenderCounterLocations } from "./hooks/BaseLayers/useRenderCounterLocations";
import { useRenderDateRangeData } from "./hooks/MapDailyTraffic/useRenderDateRangeData";
import { useFetchInitialDateData } from "./hooks/MapDailyTraffic/useFetchInitialDateData";
import { useMap24HrCycle } from "./hooks/Map24HrTraffic/useMap24HrCycle";
import useSetBaseMap from "../MapLayersControl/hooks/useSetBaseMap";
import useToggleBaseMap from "../MapLayersControl/hooks/useToggleBaseMap";

// Components
import MapLayersControl from "../MapLayersControl/MapLayersControl";

interface MapClientProps {
  data: any;
}

export default function MapClient({ data }: MapClientProps) {

  // Preloaded data
  const counterLocationData = data[0];
  const cyclingNetworkData = data[1];

  // Contexts
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
  useRenderCyclingNetwork(mapInstance, cyclingNetworkData);
  useRenderCounterLocations(mapInstance, counterLocationData);

  //// 24 Hour Traffic Player
  useMap24HrCycle(
    dateRange, timeArray, setTimeArray, counterLocationData, mapInstance, dataLayerRef, 
    timeIsPlaying, currentTimeIndex, setCurrentTimeIndex, setTimeIsPlaying,
    playIntervalRef, currentTime, setCurrentTime
  );

  //// Daily Traffic Player
  useDatePlayer(
    isPlaying, currentDateIndex, dateArray, setDateRangeData,
    setCurrentDateIndex, setIsPlaying, playIntervalRef
  );
  useFetchInitialDateData(mapInstance, dateRange, setDateRangeData);
  useRenderDateRangeData(mapInstance, dateRangeData, counterLocationData, dataLayerRef);
  useUpdateDateArray(dateRange, setDateArray, setCurrentDateIndex, generateDateRange);

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
