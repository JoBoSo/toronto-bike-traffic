import { useEffect } from 'react';
import L from 'leaflet';
import getMarkerColorRYG from '@/components/Map/utils/getMarkerColorRYG';

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

      // Determine min and max values for color scaling
      const minV = Math.min(...dateRangeData.map((d: any) => d.avg_daily_volume));
      const maxV = Math.max(...dateRangeData.map((d: any) => d.avg_daily_volume));

      // Render date range data circles
      dateRangeData.forEach((element: any) => {
        const lonLat = (data).find(
          (item: any) => Number(item.properties.location_dir_id) === Number(element.location_dir_id)
        )?.geometry.coordinates;
        
        if (lonLat) {
          const [lon, lat] = lonLat;
          const latLon: [number, number] | L.LatLngExpression = [lat, lon];

          const value = element.avg_daily_volume;
          const radius = Math.max(Math.pow(value, 0.5) / 1.5, 4);
          const color = getMarkerColorRYG(value, minV, maxV);
          
          const circle = L.circleMarker(latLon, {
            pane: "volumeMarkerPane",
            radius: radius,
            color: color,
            fillColor: color,
            fillOpacity: 0.5
          }).addTo(newLayer);

          // circle.bringToBack();
        }
      });

      newLayer.addTo(mapInstance);

      newLayer.eachLayer((layer: any) => layer.bringToBack());

      // Store reference
      dataLayerRef.current = newLayer;
    }
  }, [mapInstance, dateRangeData, data]);
}
