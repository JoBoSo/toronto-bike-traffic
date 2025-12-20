import L from 'leaflet';

/**
 * Trims a polyline to a specified length in meters.
 * @param coords Array of [lat, lon] coordinates (Leaflet-style)
 * @param maxDistanceMeters Maximum length of the polyline
 * @returns Trimmed array of coordinates
 */
export function trimRoute(
  coords: [number, number][],
  maxDistanceMeters: number
): [number, number][] {
  if (!coords || coords.length === 0) return [];

  const trimmed: [number, number][] = [coords[0]];
  let totalDistance = 0;

  for (let i = 1; i < coords.length; i++) {
    const prev = L.latLng(coords[i - 1][0], coords[i - 1][1]);
    const curr = L.latLng(coords[i][0], coords[i][1]);

    const segmentDistance = prev.distanceTo(curr); // meters
    if (totalDistance + segmentDistance >= maxDistanceMeters) {
      // interpolate last point to match exact distance
      const remaining = maxDistanceMeters - totalDistance;
      const fraction = remaining / segmentDistance;
      const lat = prev.lat + (curr.lat - prev.lat) * fraction;
      const lon = prev.lng + (curr.lng - prev.lng) * fraction;
      trimmed.push([lat, lon]);
      break;
    }

    trimmed.push(coords[i]);
    totalDistance += segmentDistance;
  }

  return trimmed;
}
