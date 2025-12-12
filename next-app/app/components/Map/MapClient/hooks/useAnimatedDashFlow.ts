import { useEffect, useRef } from "react";
import L, { Map as LeafletMap } from "leaflet";

/**
 * A reusable hook to animate dashed lines for a specific GeoJSON layer pane.
 * @param mapInstance The current Leaflet map instance.
 * @param paneName The name of the custom pane where the layer is rendered (e.g., "cyclingNetworkPane").
 * @param patternLength The total pixel length of one dash+gap cycle (e.g., 15 for '10, 5').
 * @param speed The speed of the animation (e.g., 1.0 is default speed, smaller = slower).
 */
export function useAnimatedDashFlow(
  mapInstance: LeafletMap | null,
  paneName: string,
  patternLength: number,
  speed: number = 1.0
) {
  const animationRef = useRef<number | null>(null);
  // Use a WeakMap to store the unique offset for each SVG path element
  const pathOffsets = useRef(new WeakMap<SVGPathElement, number>()).current;

  useEffect(() => {
    if (!mapInstance || !paneName) return;

    // --- 1. The Initialization Function (Fast bulk query) ---
    const initializeRandomOffsets = () => {
      setTimeout(() => {
        const pane = mapInstance.getPane(paneName);
        if (pane) {
          const paths = pane.querySelectorAll<SVGPathElement>('path.leaflet-interactive');
          paths.forEach(path => {
            const initialRandomOffset = Math.random() * patternLength;
            pathOffsets.set(path, initialRandomOffset);
            path.style.strokeDashoffset = `${initialRandomOffset}px`;
          });
          console.log(`Initialized ${paths.length} paths in pane '${paneName}'`);
        }
      }, 0);
    };

    // --- 2. The Animation Loop Function ---
    const animateLines = () => {
      const pane = mapInstance.getPane(paneName);
      if (pane) {
        const paths = pane.querySelectorAll<SVGPathElement>('path.leaflet-interactive');
        paths.forEach(path => {
          let currentOffset = pathOffsets.get(path) || 0;
          currentOffset -= speed;
          path.style.strokeDashoffset = `${currentOffset}px`;
          pathOffsets.set(path, currentOffset);
        });
      }
      animationRef.current = requestAnimationFrame(animateLines);
    };

    // --- Execution ---
    // We assume the layer has been added by another hook before this runs
    // and that the pane exists. We initialize offsets and start the loop.
    initializeRandomOffsets();
    animateLines();

    // --- Cleanup ---
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mapInstance, paneName, patternLength, speed]);
}
