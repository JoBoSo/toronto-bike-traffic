"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MarkerScaler, ScalingMethod } from '@/components/Map/utils/MarkerScaler';

export function useMark24HrTraffic(
  mapInstance: L.Map | null, 
  currtwentyFourHrCycleData: any, 
  dataLayerRef: React.MutableRefObject<L.LayerGroup | null>,
  currentTime: string,
  timeIsPlaying: boolean, 
  currentTimeIndex: number,
) {
  useEffect(() => {
    if (!mapInstance || !currtwentyFourHrCycleData || (timeIsPlaying === false && currentTimeIndex === 0)) {
      // console.log("Waiting for map instance or daily traffic data...");
      // Optionally, clear the layer if data becomes unavailable
      if (mapInstance && dataLayerRef.current) {
        mapInstance.removeLayer(dataLayerRef.current);
        dataLayerRef.current = null;
      }
      return;
    }

    if (mapInstance && currtwentyFourHrCycleData) {
      console.log("Rendering circle marker 24 hour cycle data");

      // Remove previous data layer if exists
      if (dataLayerRef.current) {
        mapInstance.removeLayer(dataLayerRef.current);
      }

      mapInstance.createPane("24HrMarkerPane");
      mapInstance.getPane("24HrMarkerPane")!.style.zIndex = "621";

      // Create new layer group for date range data
      const newLayer = L.layerGroup();

      const currData = currtwentyFourHrCycleData;

      // Create scaler for marker radius and color
      const vals = currtwentyFourHrCycleData.map((item: any[any]) => item['avg_bin_volume'] as number);
      const SCALING_METHOD: ScalingMethod = 'none';
      const LOG_BASE = 1.07;
      const MIN_RAD_PX = 5;
      const MAX_RAD_PX = 35;
      const scaler = new MarkerScaler(vals, SCALING_METHOD, LOG_BASE, MIN_RAD_PX, MAX_RAD_PX);

      // Render date range data circles
      currData.forEach((element: any) => {
        const latLon: [number, number] | L.LatLngExpression = element.coordinates;;
        const value = element.avg_bin_volume;
        const radius = scaler.getRadius(value);
        const color = scaler.getColorRYG(value);

        const circle = L.circleMarker(latLon, {
          pane: "24HrMarkerPane",
          radius: radius,
          color: color,
          fillColor: color,
          fillOpacity: 0.5
        }).addTo(newLayer);
      });

      newLayer.addTo(mapInstance);
      newLayer.eachLayer((layer: any) => layer.bringToBack());
      // Store reference
      dataLayerRef.current = newLayer;
    }
  }, [mapInstance, currtwentyFourHrCycleData, currentTime]);
}