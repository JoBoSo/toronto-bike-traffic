import { useEffect } from "react";
import L, { Map as LeafletMap } from "leaflet";

export function useRenderCounterLocations(
  mapInstance: LeafletMap | null,
  data: any
) {
  useEffect(() => {
    if (mapInstance && data && data.length > 0) {
      console.log("Rendering counter locations");
      console.log(data[0])
      
      mapInstance.createPane("counterLocationsPane");
      mapInstance.getPane("counterLocationsPane")!.style.zIndex = "630";

      const layer = L.geoJSON(data, {
        pane: "counterLocationsPane", // assign layer to pane
        onEachFeature: (feature, layer) => {
          const location_dir_id = feature.properties.location_dir_id.toString()
          const location_name = feature.properties.location_name.toString()
          const direction = feature.properties.direction.toString()
          const first_active = feature.properties.first_active.toString()
          const last_active = feature.properties.last_active.toString()
          layer.bindPopup(`
            <b>${location_name} (#${location_dir_id})</b>
            <p style="margin: 2px 0;">${direction}</p>
            <p style="margin: 2px 0;">Active from ${first_active} to ${last_active}</p>
          `);
        },
        pointToLayer: (feature, latlng) => {
          const circle = L.circleMarker(latlng, {
            pane: "counterLocationsPane",
            radius: 4,
            color: "rgba(48, 48, 48, 1)",
            fillColor: "rgba(48, 48, 48, 1)",
            fillOpacity: 1,
            weight: 1,
          });
          return circle;
        },
      });

      layer.addTo(mapInstance);
    }
  }, [mapInstance, data]);
}
