import { useEffect, useState, useMemo, useRef } from "react";
import L, { Map as LeafletMap, LatLngBounds } from "leaflet";

export function useTimeColorOverlay(
  mapInstance: LeafletMap | null,
  currentTime: string,
  timeIsPlaying: boolean,
  isPlaying: boolean,
) {
  const overlayRef = useRef<L.Rectangle | null>(null);

  // Calculated overlay color, memoized based on time state
  const overlayColorRgba = useMemo(() => {
    return getTimeBasedOverlayColor(currentTime);
  }, [currentTime]);

  const isTimeMostRecent = useRecentActivityTracker(timeIsPlaying, isPlaying);

  // Effect for initializing and managing the rectangle overlay
  useEffect(() => {
    // FIX 1: Explicitly check mapInstance before trying to remove the layer
    if (!mapInstance) {
      // Cleanup existing layer reference if map is gone
      if (overlayRef.current) {
        // We cannot call mapInstance.removeLayer() here because mapInstance is null.
        // If we reach this block, the map itself is unmounting, so we just clear the reference.
        overlayRef.current = null;
      }
      return;
    }

    const isInitialState = !timeIsPlaying && currentTime === "00:00:00";

    if (isInitialState) {
        // Remove the overlay by setting opacity to 0 (fully transparent)
        if (overlayRef.current) {
            overlayRef.current.setStyle({
                fillOpacity: 0,
            });
        }
        return; // Exit the effect early
    }

    // 1. Define bounds for the world (or a slightly oversized area)
    // This ensures the rectangle covers the map regardless of zoom level.
    const bounds: LatLngBounds = L.latLngBounds([[-90, -180], [90, 180]]);
    
    // Ensure the custom pane exists and is above the base map tiles (~Z=200)
    const PANE_NAME = 'colorOverlayPane';
    const Z_INDEX = '500';
    if (!mapInstance.getPane(PANE_NAME)) {
      mapInstance.createPane(PANE_NAME);
      mapInstance.getPane(PANE_NAME)!.style.zIndex = Z_INDEX;
    }

    if (!overlayRef.current) {
      // 2. Initialize the L.Rectangle layer
      const newOverlay = L.rectangle(bounds, {
        // Initial style. We will update this immediately after creation.
        fillColor: '#000000',
        fillOpacity: 0, 
        stroke: false, // No border stroke
        pane: PANE_NAME,
        interactive: false, // Don't block mouse events
      }).addTo(mapInstance);

      overlayRef.current = newOverlay;
    }

    // 3. Determine target color and update the rectangle layer style
    // Use the current time's color if playing OR if it's paused but past the initial "00:00:00" state.
    const useCurrentTimeColor = (timeIsPlaying) || isTimeMostRecent;
    
    const targetColorRgba = useCurrentTimeColor 
      ? overlayColorRgba // dynamic color from useMemo
      : getTimeBasedOverlayColor("12:00:00"); // default day color when paused

    // Parse RGBA string to extract hex color and opacity for Leaflet's setStyle
    const match = targetColorRgba.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    
    if (match) {
      const [, r, g, b, alphaStr] = match;
      const alpha = parseFloat(alphaStr);
      // Convert RGB to Hex for fillColor
      const hexColor = `#${(1 << 24 | (Number(r) << 16) | (Number(g) << 8) | Number(b)).toString(16).slice(1)}`;

      overlayRef.current.setStyle({
        fillColor: hexColor,
        fillOpacity: alpha,
      });
    } else {
      console.error("[Time Overlay] Failed to parse RGBA color string.");
    }

    // 4. Cleanup function
    return () => {
      // FIX 2: mapInstance is guaranteed to be defined if the effect successfully ran,
      // but in the cleanup phase of the component unmount, it can be null.
      // We must check mapInstance here before using removeLayer.
      if (mapInstance && overlayRef.current) {
        mapInstance.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
    };

  }, [mapInstance, currentTime, timeIsPlaying, isPlaying, overlayColorRgba]);
}



/**
 * Tracks which of two boolean states (timeIsPlaying or isPlaying) was the most
 * recent to transition from false to true.
 *
 * @param timeIsPlaying The state related to the clock/time animation.
 * @param isPlaying The state related to the secondary process/playback.
 * @returns {boolean} true if timeIsPlaying is currently true OR was the most recent to be true.
 * false if isPlaying is currently true OR was the most recent to be true (or if neither has ever been true).
 */
function useRecentActivityTracker(
  timeIsPlaying: boolean,
  isPlaying: boolean
): boolean {
  // lastTimeIsPlayingTrue starts at 0.
  const lastTimeIsPlayingTrue = useRef(0);
  // lastIsPlayingTrue starts at 1, ensuring isPlaying is assumed the winner 
  // if neither has ever been true (1 > 0).
  const lastIsPlayingTrue = useRef(1); 

  // Effect to update timestamps when the flags switch to true (the history tracker)
  useEffect(() => {
    const now = Date.now();
    
    // We only update the ref if the current state is true
    if (timeIsPlaying) {
      lastTimeIsPlayingTrue.current = now;
    }
    
    if (isPlaying) {
      lastIsPlayingTrue.current = now;
    }
    
  }, [timeIsPlaying, isPlaying]);

  // Memoized value to determine the result based on current state AND history.
  const isTimeMostRecent = useMemo(() => {
    
    // 1. **Immediate State Check (The Fix):** // If one is currently true, that one wins immediately. 
    // If both are true, the one that turned on last (which updated its timestamp most recently) wins.
    if (timeIsPlaying && !isPlaying) {
      return true;
    }
    if (isPlaying && !timeIsPlaying) {
      return false;
    }
    // If both are true or both are false, proceed to history comparison.

    // 2. **History Comparison (Fallback):**
    const timeTimestamp = lastTimeIsPlayingTrue.current;
    const isTimestamp = lastIsPlayingTrue.current;

    // Time wins if its timestamp is greater.
    return timeTimestamp > isTimestamp;

  }, [timeIsPlaying, isPlaying]); // Depend on current state to force computation

  return isTimeMostRecent;
}



/**
 * Calculates a smooth RGBA color for the overlay based on the current time string.
 * The output color is used to set the fillColor (RGB/Hex) and fillOpacity (Alpha) of the L.rectangle.
 *
 * @param currentTimeStr The current time as a string (e.g., '14:30:00').
 * @returns An RGBA color string (e.g., 'rgba(5, 50, 100, 0.3)').
 */
const getTimeBasedOverlayColor = (currentTimeStr: string): string => {
  // 1. Parse the "HH:MM:SS" string into H, M, S
  const [h, m, s] = currentTimeStr.split(':').map(Number);

  // 2. Calculate the fractional hour (e.g., 14.5 for 14:30:00)
  const currentHour = h + m / 60 + s / 3600;

  // Define Key Times (Hours)
  const startDawn = 6;  // 05:00 - Start transition to day
  const midDay = 10;    // 12:00 - Full day color
  const startDusk = 17; // 18:00 - Start transition to night
  const endDusk = 21;   // 22:00 - Full night color

  // Define Key Colors (R, G, B, A)
  // Night (Dark Blue, Opaque)
  const nightColor: [number, number, number, number] = [0, 20, 70, 0.5];

  // Day (Bright Yellow/White, Transparent)
  const dayColor: [number, number, number, number] = [255, 255, 200, 0.05];

  let r: number, g: number, b: number, a: number;

  const interpolate = (t: number, start: number, end: number): number => start + (end - start) * t;

  // --- NIGHT (22:00 to 05:00) ---
  if (currentHour >= endDusk || currentHour < startDawn) {
    [r, g, b, a] = nightColor;
  }
  // --- DAWN (05:00 to 12:00) ---
  else if (currentHour >= startDawn && currentHour < midDay) {
    const t = (currentHour - startDawn) / (midDay - startDawn); // 0.0 to 1.0
    r = interpolate(t, nightColor[0], dayColor[0]);
    g = interpolate(t, nightColor[1], dayColor[1]);
    b = interpolate(t, nightColor[2], dayColor[2]);
    a = interpolate(t, nightColor[3], dayColor[3]);
  }
  // --- DAY (12:00 to 18:00) ---
  else if (currentHour >= midDay && currentHour < startDusk) {
    [r, g, b, a] = dayColor;
  }
  // --- DUSK (18:00 to 22:00) ---
  else if (currentHour >= startDusk && currentHour < endDusk) {
    const t = (currentHour - startDusk) / (endDusk - startDusk); // 0.0 to 1.0
    r = interpolate(t, dayColor[0], nightColor[0]);
    g = interpolate(t, dayColor[1], nightColor[1]);
    b = interpolate(t, dayColor[2], nightColor[2]);
    a = interpolate(t, dayColor[3], nightColor[3]);
  } else {
    // Fallback
    [r, g, b, a] = nightColor;
  }

  // Ensure RGBA values are clamped and formatted correctly
  const finalR = Math.round(Math.max(0, Math.min(255, r)));
  const finalG = Math.round(Math.max(0, Math.min(255, g)));
  const finalB = Math.round(Math.max(0, Math.min(255, b)));
  const finalA = parseFloat(a.toFixed(2));

  return `rgba(${finalR}, ${finalG}, ${finalB}, ${finalA})`;
};