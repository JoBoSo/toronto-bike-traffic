"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapResizerProps {
  isSidebarCollapsed: boolean;
}

/**
 * Logic component to handle map resizing when the layout changes.
 * Must be a child of <MapContainer />
 */
export default function MapResizer({ isSidebarCollapsed }: MapResizerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Small delay to allow the CSS transition of the sidebar to finish
    // Match this timer to your SCSS transition duration (e.g., 300ms)
    const timer = setTimeout(() => {
      console.log("Invalidating map size due to layout change");
      map.invalidateSize({ animate: true });
    }, 0); 

    return () => clearTimeout(timer);
  }, [map, isSidebarCollapsed]);

  return null; // This component provides logic, not UI
}