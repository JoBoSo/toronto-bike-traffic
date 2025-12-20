"use client";

import { useMemo } from "react";
import { Rectangle, Pane } from "react-leaflet";
import { useMapContext } from "@/src/contexts/MapContext";
import { LatLngBoundsExpression } from "leaflet";

// Keep your color calculation logic outside the component
const getTimeBasedOverlayColor = (currentTimeStr: string) => {
  const [h, m, s] = currentTimeStr.split(':').map(Number);
  const currentHour = h + m / 60 + s / 3600;

  const startDawn = 6, midDay = 10, startDusk = 17, endDusk = 21;
  const nightColor = [0, 20, 70, 0.5];
  const dayColor = [255, 255, 200, 0.05];

  let r, g, b, a;
  const interpolate = (t: number, start: number, end: number) => start + (end - start) * t;

  if (currentHour >= endDusk || currentHour < startDawn) {
    [r, g, b, a] = nightColor;
  } else if (currentHour >= startDawn && currentHour < midDay) {
    const t = (currentHour - startDawn) / (midDay - startDawn);
    [r, g, b, a] = [interpolate(t, nightColor[0], dayColor[0]), interpolate(t, nightColor[1], dayColor[1]), interpolate(t, nightColor[2], dayColor[2]), interpolate(t, nightColor[3], dayColor[3])];
  } else if (currentHour >= midDay && currentHour < startDusk) {
    [r, g, b, a] = dayColor;
  } else {
    const t = (currentHour - startDusk) / (endDusk - startDusk);
    [r, g, b, a] = [interpolate(t, dayColor[0], nightColor[0]), interpolate(t, dayColor[1], nightColor[1]), interpolate(t, dayColor[2], nightColor[2]), interpolate(t, dayColor[3], nightColor[3])];
  }

  return {
    hex: `#${(1 << 24 | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1)}`,
    alpha: a
  };
};

export default function TimeColorOverlay() {
  const { currentTime, timeIsPlaying, isPlaying } = useMapContext();

  // 1. Determine if we should show the overlay
  // Initial state logic from your original hook
  const isInitialState = (!timeIsPlaying && currentTime === "00:00:00") || isPlaying;

  // 2. Calculate Color and Alpha
  const { hex, alpha } = useMemo(() => {
    return getTimeBasedOverlayColor(currentTime);
  }, [currentTime]);

  // 3. Global Bounds (Covers the whole world)
  const bounds: LatLngBoundsExpression = [[-90, -180], [90, 180]];

  return (
    /* We use a Pane to ensure the color tint is above the base map 
       but potentially below your labels or markers. */
    <Pane name="colorOverlayPane" style={{ zIndex: 500 }}>
      <Rectangle
        bounds={bounds}
        pathOptions={{
          fillColor: hex,
          fillOpacity: isInitialState ? 0 : alpha,
          stroke: false,
          interactive: false, // Important: don't block map clicks
        }}
      />
    </Pane>
  );
}