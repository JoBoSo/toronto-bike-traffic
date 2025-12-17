import { useEffect } from 'react';
import L from 'leaflet';
import { MarkerScaler, ScalingMethod } from '@/components/Map/utils/MarkerScaler';
import {CounterLocationFeature } from '@/src/interfaces/counterLocationTypes'
import { DailyLocationCount } from "@/src/interfaces/flaskApiResponseTypes/DailyCountsByLocNameInDateRangeResponse";

export function useMarkDailyTraffic(
  mapInstance: L.Map | null, 
  currDateData: DailyLocationCount[] | null, 
  counterLocations: CounterLocationFeature[], 
  dataLayerRef: React.MutableRefObject<L.LayerGroup | null>,
  isPlaying: boolean,
  currentDateIndex: number,
) {
  useEffect(() => {
    if (!mapInstance || !currDateData || currDateData.length === 0 || (isPlaying === false && currentDateIndex === 0)) {
      console.log("Waiting for map instance or daily traffic data...");
      // Optionally, clear the layer if data becomes unavailable
      if (mapInstance && dataLayerRef.current) {
        mapInstance.removeLayer(dataLayerRef.current);
        dataLayerRef.current = null;
      }
      return;
    }

    console.log("Rendering date range data");

    // Remove previous data layer if exists
    if (dataLayerRef.current) {
      mapInstance.removeLayer(dataLayerRef.current);
    }

    mapInstance.createPane("volumeMarkerPane");
    mapInstance.getPane("volumeMarkerPane")!.style.zIndex = "620";

    // Create new layer group for date range data
    const newLayer = L.layerGroup();

    // Create scaler for marker radius and color
    const vals = currDateData.map((item) => item.daily_volume); 
    const SCALING_METHOD: ScalingMethod = 'none';
    const LOG_BASE = 1.07;
    const MIN_RAD_PX = 5;
    const MAX_RAD_PX = 35;
    const scaler = new MarkerScaler(vals, SCALING_METHOD, LOG_BASE, MIN_RAD_PX, MAX_RAD_PX);

    // Render date range data circles
    currDateData.forEach((element: any) => {
      const lonLat = (counterLocations).find(
        (item: any) => Number(item.properties.location_dir_id) === Number(element.location_dir_id)
      )?.geometry.coordinates;
      
      if (lonLat) {
        const [lon, lat] = lonLat;
        const latLon: [number, number] | L.LatLngExpression = [lat, lon];
        const value = element.daily_volume;
        const radius = scaler.getRadius(value)/60; // div by 60 if using none scaling
        const color = scaler.getColorRYG(value);
        
        const circle = L.circleMarker(latLon, {
          pane: "volumeMarkerPane",
          radius: radius,
          color: color,
          fillColor: color,
          fillOpacity: 0.5
        }).addTo(newLayer);
      }
    });
    newLayer.addTo(mapInstance);
    newLayer.eachLayer((layer: any) => layer.bringToBack());
    // Store reference
    dataLayerRef.current = newLayer;
  }, [mapInstance, currDateData, counterLocations]);
}
