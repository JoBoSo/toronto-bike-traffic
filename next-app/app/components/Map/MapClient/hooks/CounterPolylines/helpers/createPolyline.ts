import L, { Polyline, PolylineOptions } from 'leaflet';

export interface CreatePolylineOptions {
  coords: [number, number][];
  color?: string;
  weight?: number;
  dashArray?: string; // e.g. "5, 10" for dashed lines
  opacity?: number;
  pane?: string;
}

/**
 * Returns a Leaflet Polyline instance without adding it to a map.
 */
export function createPolyline({
  coords,
  color = 'blue',
  weight = 4,
  dashArray,
  opacity = 1,
}: CreatePolylineOptions): Polyline {
  const options: PolylineOptions = { color, weight, opacity };

  if (dashArray) {
    options.dashArray = dashArray;
  }

  return L.polyline(coords, options);
}
