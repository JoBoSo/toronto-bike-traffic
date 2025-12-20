"use client";

import styles from "@/components/Map/MapClient/MapClient.module.scss";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Pane, ScaleControl } from 'react-leaflet';
import "react-datepicker/dist/react-datepicker.css";
import "leaflet/dist/leaflet.css";

// Contexts
import { usePageContentContext } from "@/src/contexts/PageContentContext";
import { useMapContext } from "@/src/contexts/MapContext";

// Hooks
import { useControl24HrTrafficPlayer } from "@/components/Map/TwentyFourHrTrafficPlayback/useControl24HrTrafficPlayer";
import { useInitTimeArray } from "@/components/Map/TwentyFourHrTrafficPlayback/useInitTimeArray"
import { useGet24HrTraffic } from "@/components/Map/TwentyFourHrTrafficPlayback/useGet24HrTraffic"
import { useSetCurr24HrTrafficData } from "@/components/Map/TwentyFourHrTrafficPlayback/useSetCurr24HrTrafficData"; 
import { useGetDailyTrafficData } from "@/components/Map/DailyTrafficPlayback/useGetDailyTrafficData";
import { useGetDailyTrafficByLocNameData } from "@/components/Map/DailyTrafficPlayback/useGetDailyTrafficByLocNameData";
import { useInitDateArray } from "@/components/Map/DailyTrafficPlayback/useInitDateArray";
import { useControlDailyTrafficPlayer } from "@/components/Map/DailyTrafficPlayback/useControlDailyTrafficPlayer";
import { useSetCurrDayData } from "@/components/Map/DailyTrafficPlayback/useSetCurrDayData";
import { useCacheCounterRoutes } from "@/components/Map/AnimatedCounterPolylines/useCacheCounterRoutes";
import { useRenderCounterPolylines } from "@/components/Map/AnimatedCounterPolylines/useRenderCounterPolylines";
import { useRenderAnimatedCounterPolylines } from "@/components/Map/AnimatedCounterPolylines/useRenderAnimatedCounterPolylines";
import { CounterPolyline } from "@/components/Map/AnimatedCounterPolylines/helpers/renderPolylines";
import { CounterRoute } from "@/components/Map/AnimatedCounterPolylines/helpers/getCounterRoutes";
import { useCreatePolylineConfig } from "@/components/Map/AnimatedCounterPolylines/useCreatePolylineConfig";
import { PolylineAnimationConfig } from "@/components/Map/AnimatedCounterPolylines/useAnimatedPolylineFlow";
import { useGet24HrTrafficByLocName } from '@/components/Map/TwentyFourHrTrafficPlayback/useGet24HrTrafficByLocName';

// Components
import MapLayersControl from "@/components/Map/MapLayersControl/MapLayersControl";
import PlaybackInfoOverlay from "@/components/Map/PlaybackInfoOverlay/PlaybackInfoOverlay";
import formatShortDate from "@/src/utils/formatShortDate"
import CyclingNetworkLayer from "@/components/Map/CyclingNetworkLayer/CyclingNetworkLayer";
import CounterLocationsLayer from "@/components/Map/CounterLocationsLayer/CounterLocationsLayer";
import MapResizer from "@/components/Map/MapResizer/MapResizer";
import TimeColorOverlay from "@/components/Map/TwentyFourHrTrafficPlayback/TimeColorOverlay/TimeColorOverlay";
import TrafficPlaybackLayer from "@/components/Map/TwentyFourHrTrafficPlayback/TrafficPlaybackLayer/TrafficPlaybackLayer";
import DailyTrafficPlaybackLayer from "@/components/Map/DailyTrafficPlayback/DailyTrafficPlaybackLayer/DailyTrafficPlaybackLayer";

// utils
import { convertTo12HourTime } from "@/src/utils/convertTo12HourTime"

interface MapClientProps {
  isSidebarCollapsed: boolean; 
}

export default function MapClient({ isSidebarCollapsed }: MapClientProps) {
  // Contexts
  const { counterLocations, counterGroups, cyclingNetwork, isLoading } = usePageContentContext();
  const {
    isPlaying,
    timeIsPlaying, 
    dateArray,
    currentDateIndex,
    currentTime,
  } = useMapContext();

  const [isSatellite, setIsSatellite] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  //// Base Layers
  // useInitializeMap(mapRef, mapInstance, setMapInstance);
  // useRenderCyclingNetwork(mapInstance, cyclingNetwork);
  // useRenderCounterLocations(mapInstance, counterLocations);
  // useRenderConsolidatedCounterLocations(mapInstance, counterGroups);
  // useFitMapToContainer(mapInstance, isSidebarCollapsed);

  //// 24 Hour Traffic Player
  // useGet24HrTraffic(counterLocations);
  useGet24HrTrafficByLocName();
  useInitTimeArray();
  const currHr24CycleData = useSetCurr24HrTrafficData();
  useControl24HrTrafficPlayer(playIntervalRef)
  
  //// animated polylines
  // const routes: CounterRoute[] | undefined = useCacheCounterRoutes(counterLocations);
  // const polylines: CounterPolyline[] | undefined = useRenderCounterPolylines(mapInstance, routes, "counterPolylinePane", "629");
  // const polylineConfigs: PolylineAnimationConfig[] | undefined = useCreatePolylineConfig(polylines, currHr24CycleData);
  // useRenderAnimatedCounterPolylines(mapInstance, polylines, polylineConfigs);

  //// Daily Traffic Player
  useControlDailyTrafficPlayer(playIntervalRef);
  // useGetDailyTrafficData(mapInstance);
  useGetDailyTrafficByLocNameData();
  const currDayData = useSetCurrDayData();
  useInitDateArray();

  return (
    <div className={styles.mapClientContainer}>
      <MapContainer 
        className={styles.actualLeafletMap}
        center={[43.664, -79.38]} 
        zoom={12.3} 
        zoomSnap={0}
        zoomControl={false}
        wheelPxPerZoomLevel={5}
        attributionControl={false}
      >
        {/* Base Layer Logic */}
        {isSatellite ? (
          <TileLayer
            key="satellite"
            url="https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            key="voyager"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            maxZoom={19}
            subdomains="abcd"
          />
        )}

        {/* Labels Pane - Always on Top of base tiles */}
        <Pane name="labelsPane" style={{ zIndex: 615 }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png" />
        </Pane>

        <ScaleControl position="bottomleft" metric={true} imperial={false} />

        {/* Custom Data Layers */}
        <CyclingNetworkLayer geoJsonData={cyclingNetwork} />
        <CounterLocationsLayer data={counterGroups} />
        <MapResizer isSidebarCollapsed={isSidebarCollapsed} />

        {/* Animation Layers */}
        <TimeColorOverlay />
        <TrafficPlaybackLayer trafficData={currHr24CycleData} />
        <DailyTrafficPlaybackLayer currDateData={currDayData} />
      </MapContainer>

      {/* UI Overlays */}
      <MapLayersControl isSatellite={isSatellite} setIsSatellite={setIsSatellite} />
      
      {timeIsPlaying && (
        <PlaybackInfoOverlay info={convertTo12HourTime(currentTime)} />
      )}
      
      {isPlaying && dateArray[currentDateIndex] && (
        <PlaybackInfoOverlay info={formatShortDate(dateArray[currentDateIndex])} />
      )}
    </div>
  );
}
