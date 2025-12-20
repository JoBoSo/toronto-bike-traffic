"use client";

import { useMemo } from "react";
import { CircleMarker, Popup, Pane } from "react-leaflet";
import { MarkerScaler, ScalingMethod } from '@/components/Map/utils/MarkerScaler';
import { useMapContext } from "@/src/contexts/MapContext";

interface TrafficPlaybackLayerProps {
  trafficData: any[] | null;
}

export default function TrafficPlaybackLayer({ trafficData }: TrafficPlaybackLayerProps) {
  const { timeIsPlaying, currentTimeIndex } = useMapContext();

  // 1. Guard: Hide markers if not playing and at start, or no data
  const shouldRender = !(!timeIsPlaying && currentTimeIndex === 0) && trafficData && trafficData.length > 0;

  // 2. Memoize the Scaler
  const scaler = useMemo(() => {
    if (!trafficData) return null;
    
    const vals = trafficData.map((item: any) => item.avg_bin_volume as number);
    const SCALING_METHOD: ScalingMethod = 'none';
    const LOG_BASE = 1.07;
    const MIN_RAD_PX = 5;
    const MAX_RAD_PX = 35;
    
    return new MarkerScaler(vals, SCALING_METHOD, LOG_BASE, MIN_RAD_PX, MAX_RAD_PX);
  }, [trafficData]);

  // 3. THE KEY OPTIMIZATION: Memoize the rendered markers
  const renderedMarkers = useMemo(() => {
    if (!trafficData || !scaler) return null;

    return trafficData.map((element: any, index: number) => {
      // Use the pre-parsed position from your useSetCurr24HrTrafficData hook
      const latLon = element.latLon; 
      const value = element.avg_bin_volume;
      
      const radius = 4 + 0.4 * scaler.getRadius(value); // circle marker
      const color = scaler.getColorRYG(value);

      return (
        <CircleMarker
          key={`${element.location_id || index}`}
          center={latLon}
          radius={radius}
          pathOptions={{
            pane: '24HrMarkerPane',
            color: color,
            fillColor: color,
            fillOpacity: 0.5,
            weight: 2
          }}
        >
          <Popup pane="popupPane">
            <p style={{ margin: 0 }}>
              <strong>Avg # of cyclists:</strong> {value.toFixed(2)}
            </p>
          </Popup>
        </CircleMarker>
      );
    });
  }, [trafficData, scaler]); // Only re-runs when trafficData or scaler changes

  if (!shouldRender || !renderedMarkers) return null;

  return (
    <Pane name="24HrMarkerPane" style={{ zIndex: 621 }}>
      {renderedMarkers}
    </Pane>
  );
}