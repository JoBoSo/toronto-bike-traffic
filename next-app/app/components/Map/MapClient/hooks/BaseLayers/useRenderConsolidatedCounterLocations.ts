import { useEffect } from "react";
import L, { latLng, Map as LeafletMap } from "leaflet";
import styles from "@/components/Map/MapClient/hooks/BaseLayers/useRenderCounterLocations.module.scss";

export function useRenderConsolidatedCounterLocations(
  mapInstance: LeafletMap | null,
  data: any
) {
  useEffect(() => {
    if (mapInstance && data && data.length > 0) {
      console.log("Rendering consolidated counter locations");
      
      mapInstance.createPane("counterLocationsPane");
      mapInstance.getPane("counterLocationsPane")!.style.zIndex = "630";

      const layer = L.geoJSON(data, {
        pane: "counterLocationsPane",
        onEachFeature: (feature, layer) => {
          const location_dir_ids = feature.properties.location_dir_ids.toString()
          const name = feature.properties.name.toString()
          const directions = feature.properties.directions.toString()
          const first_active = new Date(feature.properties.first_active).toISOString().split('T')[0];
          const last_active = new Date(feature.properties.last_active).toISOString().split('T')[0];
          layer.bindPopup(`
            <b>Bike Counter</b><br/>
            <p style="margin: 2px 0;">${name}</p>
            <p style="margin: 2px 0;">Directions: ${directions}</p>
            <p style="margin: 2px 0;">Active from ${first_active} to ${last_active}</p>
            <p style="margin: 2px 0;">Device IDs: ${location_dir_ids}</p>
          `);
        },
        pointToLayer: (feature, latlng) => {
          const circle = L.circleMarker(latlng, {
            pane: "counterLocationsPane",
            radius: 5,
            color: "#1e2674ff",
            weight: 0,
            fillColor: "#1e2674ff",
            fillOpacity: 0.4,
            className: styles['radar-pulse-circle-color'],
          });
          return circle;
        },
      });

      layer.addTo(mapInstance);
    }
  }, [mapInstance, data]);
}
