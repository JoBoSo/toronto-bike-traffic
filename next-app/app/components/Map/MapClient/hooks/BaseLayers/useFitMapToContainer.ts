import { useEffect } from "react";
import { Map as LeafletMap } from "leaflet";

export function useFitMapToContainer(mapInstance: LeafletMap | null, isSidebarCollapsed: boolean) { 
  //// Invalidate Map size when container changes
  useEffect(() => {
    if (mapInstance) {
      const timer = setTimeout(() => {
        mapInstance.invalidateSize();
      }, 0); // milliseconds to wait before reseting container size must match sidebar transition css

      return () => clearTimeout(timer);
    }
  }, [mapInstance, isSidebarCollapsed]); // Re-run when map loads or sidebar state changes
}