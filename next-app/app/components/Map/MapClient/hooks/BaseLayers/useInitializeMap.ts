import { useEffect } from "react";
import L, { Map as LeafletMap } from "leaflet";

export function useInitializeMap(
  mapRef: React.RefObject<HTMLDivElement | null>, 
  mapInstance: LeafletMap | null, 
  setMapInstance: React.Dispatch<React.SetStateAction<LeafletMap | null>>
) {
  useEffect(() => {
    if (mapRef.current && !mapInstance) {
      console.log("Initializing map");
      
      const map = L.map("map", {
        center: [43.664, -79.38], // [vert dec up/inc down, horiz dec ]
        zoom: 12.3,
        zoomSnap: 0,
        wheelPxPerZoomLevel: 5,
        attributionControl: false,
      });

      map.createPane("labelsPane");
      map.getPane("labelsPane")!.style.zIndex = "615";

      // labels overlay
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
        {
          pane: "labelsPane",
          subdomains: "abcd",
          attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 20,
        }
      ).addTo(map);

      // World boundaries overlay
      // L.tileLayer(
      //   "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      //   { maxZoom: 19, opacity: 0.7 }
      // ).addTo(map);

      // Streets overlay
      // L.tileLayer(
      //   "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
      //   { maxZoom: 19, opacity: 0.7 }
      // ).addTo(map);

      setMapInstance(map);

      return () => {
        map.remove();
      };
    }
  }, []);
}
