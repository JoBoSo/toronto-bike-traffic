import { useEffect } from "react";
import L from "leaflet"

export default function useToggleBaseMap(
  mapInstance: L.Map | null,
  digitalLayerRef: React.RefObject<L.TileLayer | null>,
  satelliteLayerRef: React.RefObject<L.TileLayer | null>,
  isSatellite: boolean,
) {
  // Toggle base layer
  useEffect(() => {
    if (!mapInstance) return;

    if (isSatellite) {
      digitalLayerRef.current?.remove();
      satelliteLayerRef.current?.addTo(mapInstance);
    } else {
      satelliteLayerRef.current?.remove();
      digitalLayerRef.current?.addTo(mapInstance);
    }
  }, [isSatellite, mapInstance]);

}
