import { useEffect } from 'react';
import L from 'leaflet';
import { MarkerScaler, ScalingMethod } from '@/components/Map/utils/MarkerScaler';

export function useRenderDateRangeData(
  mapInstance: L.Map | null, 
  dateRangeData: any, 
  data: any, 
  dataLayerRef: React.MutableRefObject<L.LayerGroup | null>
) {
  useEffect(() => {
    if (mapInstance && dateRangeData) {
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
      const vals = dateRangeData.map((item: any[any]) => item['avg_daily_volume'] as number);
      const SCALING_METHOD: ScalingMethod = 'linear';
      const LOG_BASE = 1.07;
      const MIN_RAD_PX = 5;
      const MAX_RAD_PX = 35;
      const scaler = new MarkerScaler(vals, SCALING_METHOD, LOG_BASE, MIN_RAD_PX, MAX_RAD_PX);

      // Render date range data circles
      dateRangeData.forEach((element: any) => {
        const lonLat = (data).find(
          (item: any) => Number(item.properties.location_dir_id) === Number(element.location_dir_id)
        )?.geometry.coordinates;
        
        if (lonLat) {
          const [lon, lat] = lonLat;
          const latLon: [number, number] | L.LatLngExpression = [lat, lon];
          const value = element.avg_daily_volume;
          const radius = scaler.getRadius(value); // div by 60 if using none scaling
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
    }
  }, [mapInstance, dateRangeData, data]);
}
