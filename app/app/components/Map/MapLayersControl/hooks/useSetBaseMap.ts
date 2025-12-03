import { useEffect } from "react";
import L from "leaflet"

export default function useSetBaseMap(
  mapInstance: L.Map | null,
  digitalLayerRef: React.RefObject<L.TileLayer | null>,
  satelliteLayerRef: React.RefObject<L.TileLayer | null>,
) {

  // Setup base layers after map loads
  useEffect(() => {
    if (!mapInstance) return;

    // Digital base map layer
    digitalLayerRef.current = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, subdomains: "abcd" }
    ).addTo(mapInstance);

    // Satellite layer (initially hidden)
    satelliteLayerRef.current = L.tileLayer(
      "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19 }
    );

  }, [mapInstance]);

}
