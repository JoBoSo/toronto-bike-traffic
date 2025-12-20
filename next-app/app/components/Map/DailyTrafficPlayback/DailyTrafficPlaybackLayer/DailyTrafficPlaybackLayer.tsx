"use client";

import { useMemo } from "react";
import { CircleMarker, Pane, Tooltip, Popup } from "react-leaflet";
import { MarkerScaler, ScalingMethod } from '@/components/Map/utils/MarkerScaler';
import { DailyLocationCount } from "@/src/interfaces/flaskApiResponseTypes/DailyCountsByLocNameInDateRangeResponse";
import { useMapContext } from "@/src/contexts/MapContext";

interface DailyTrafficPlaybackLayerProps {
  currDateData: DailyLocationCount[] | null;
}

export default function DailyTrafficPlaybackLayer({ currDateData }: DailyTrafficPlaybackLayerProps) {
  const { isPlaying, currentDateIndex } = useMapContext();

  // 1. Guard: Same logic as your hook but declarative
  const shouldRender = !(!isPlaying && currentDateIndex === 0) && currDateData && currDateData.length > 0;

  // 2. Memoize Scaler: Calculate once per day/frame
  const scaler = useMemo(() => {
    if (!currDateData) return null;
    
    const vals = currDateData.map((item) => item.daily_volume);
    const SCALING_METHOD: ScalingMethod = 'none';
    const LOG_BASE = 1.07;
    const MIN_RAD_PX = 5;
    const MAX_RAD_PX = 35;
    
    return new MarkerScaler(vals, SCALING_METHOD, LOG_BASE, MIN_RAD_PX, MAX_RAD_PX);
  }, [currDateData]);

  // 3. Memoize the Markers: Only re-map if data or scaler changes
  const renderedMarkers = useMemo(() => {
    if (!shouldRender || !currDateData || !scaler) return null;

    return currDateData.map((element: any, index: number) => {
      const value = element.daily_volume;
      // Note: Using 'latLon' which was pre-parsed in useSetCurrDayData
      const latLon = element.latLon; 
      
      // const radius = 100 + 0.2 * scaler.getRadius(value); // for Circle
      const radius = 4 + 0.006 * scaler.getRadius(value); // for CircleMarker
      const color = scaler.getColorRYG(value);

      return (
        <CircleMarker
          key={`${element.location_id || index}`}
          center={latLon}
          radius={radius}
          pathOptions={{
            pane: 'volumeMarkerPane',
            color: color,
            fillColor: color,
            fillOpacity: 0.5,
            weight: 2
          }}
        >
          {!isPlaying && <Popup pane="popupPane">
            <p style={{ margin: 0 }}>
              <strong>{element.name}</strong><br/>
              Daily # of cyclists: {value.toFixed(0)}
            </p>
          </Popup>}
        </CircleMarker>
      );
    });
  }, [currDateData, scaler, shouldRender]);

  if (!renderedMarkers) return null;

  return (
    <Pane name="volumeMarkerPane" style={{ zIndex: 620 }}>
      {renderedMarkers}
    </Pane>
  );
}