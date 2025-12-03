"use client";

import { useEffect } from "react";
import L from "leaflet";

export function useRenderCircleMarkers(
  mapInstance: L.Map | null, 
  currtwentyFourHrCycleData: any, 
  dataLayerRef: React.MutableRefObject<L.LayerGroup | null>,
  currentTime: string,
) {
  useEffect(() => {
    if (mapInstance && currtwentyFourHrCycleData) {
      console.log("Rendering circle marker 24 hour cycle data");

      function getColor(value: number, min: number, max: number) {
        if (min === max) {
          return "rgb(255,255,0)";
        }

        const t = (value - min) / (max - min);
        if (t < 0.5) {
          const k = t / 0.5;
          return `rgb(255, ${Math.round(255 * k)}, 0)`;
        } else {
          const k = (t - 0.5) / 0.5;
          return `rgb(${Math.round(255 * (1 - k))}, 255, 0)`;
        }
      }

      // Determine min and max values for color scaling
      const minV = Math.min(...currtwentyFourHrCycleData.map((d: any) => d.avg_bin_volume));
      const maxV = Math.max(...currtwentyFourHrCycleData.map((d: any) => d.avg_bin_volume));

      // Remove previous data layer if exists
      if (dataLayerRef.current) {
        mapInstance.removeLayer(dataLayerRef.current);
      }

      mapInstance.createPane("24HrMarkerPane");
      mapInstance.getPane("24HrMarkerPane")!.style.zIndex = "621";

      // Create new layer group for date range data
      const newLayer = L.layerGroup();

      const currData = currtwentyFourHrCycleData;
      // console.log(currentTime)
      // console.log(currData)
      // console.log(currtwentyFourHrCycleData[12])

      // Render date range data circles
      currData.forEach((element: any) => {
        const latLon: [number, number] | L.LatLngExpression = element.coordinates;;
        
        const value = element.avg_bin_volume;
        // const radius = Math.max(Math.pow(value, 0.7), 4);
        const radius = Math.max(3 * value, 4);
        const color = getColor(value, minV, maxV);

        const circle = L.circleMarker(latLon, {
          pane: "24HrMarkerPane",
          radius: radius,
          color: color,
          fillColor: color,
          fillOpacity: 0.5
        }).addTo(newLayer);

        // circle.bringToBack();
      });

      newLayer.addTo(mapInstance);
      newLayer.eachLayer((layer: any) => layer.bringToBack());
      // Store reference
      dataLayerRef.current = newLayer;
    }
  }, [mapInstance, currtwentyFourHrCycleData, currentTime]);
}