import { useEffect } from "react";
import L, { Map as LeafletMap } from "leaflet";

export function useRenderCounterLocations(
  mapInstance: LeafletMap | null,
  data: any
) {
  useEffect(() => {
    if (mapInstance && data && data.length > 0) {
      console.log("Rendering counter locations");
      
      mapInstance.createPane("counterLocationsPane");
      mapInstance.getPane("counterLocationsPane")!.style.zIndex = "630";

      const layer = L.geoJSON(data, {
        pane: "counterLocationsPane", // assign layer to pane
        onEachFeature: (feature, layer) => {
          layer.bindPopup("");
          layer.on("popupopen", (e) => {
            e.popup.setContent(
              feature.properties.location_dir_id.toString() +
                ", " +
                feature.properties.location_name.toString()
            );
          });
        },
        pointToLayer: (feature, latlng) => {
          const circle = L.circleMarker(latlng, {
            pane: "counterLocationsPane", // assign circle to pane
            radius: 4,
            color: "rgba(48, 48, 48, 1)",
            fillColor: "rgba(48, 48, 48, 1)",
            fillOpacity: 1,
            weight: 1,
          });
          // circle.bringToFront(); // ensures this circle is above other layers
          return circle;
        },
      });

      layer.addTo(mapInstance);
    }
  }, [mapInstance, data]);
}
