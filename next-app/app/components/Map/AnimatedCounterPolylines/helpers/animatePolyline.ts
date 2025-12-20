import { Map as LeafletMap } from 'leaflet';

interface AnimateDashFlowOptions {
  map: LeafletMap;
  paneName: string;
  patternLength: number;
  speed?: number;
}

/**
 * Animate dashed lines in a given pane.
 */
export function animatePolyline({
  map,
  paneName,
  patternLength,
  speed = 1.0,
}: AnimateDashFlowOptions): { cancel: () => void } {
  const animationRef: { current: number | null } = { current: null };
  const pathOffsets = new WeakMap<SVGPathElement, number>();

  const initializeOffsets = () => {
    const pane = map.getPane(paneName);
    if (!pane) return;

    const paths = pane.querySelectorAll<SVGPathElement>('path.leaflet-interactive');
    paths.forEach(path => {
      const offset = Math.random() * patternLength;
      pathOffsets.set(path, offset);
      path.style.strokeDashoffset = `${offset}px`;
    });
  };

  const animate = () => {
    const pane = map.getPane(paneName);
    if (!pane) return;

    const paths = pane.querySelectorAll<SVGPathElement>('path.leaflet-interactive');
    paths.forEach(path => {
      let offset = pathOffsets.get(path) || 0;
      offset -= speed;
      pathOffsets.set(path, offset);
      path.style.strokeDashoffset = `${offset}px`;
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  // Start
  initializeOffsets();
  animate();

  return {
    cancel: () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    },
  };
}
