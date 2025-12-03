import { useEffect } from 'react';
import L from 'leaflet';

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
          const color = getColor(value, minV, maxV);
          
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
