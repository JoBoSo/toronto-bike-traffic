import L from 'leaflet';

/**
 * Offsets a polyline to create a side-by-side effect.
 * @param coords Array of [lat, lon] coordinates
 * @param offsetMeters Positive = right, Negative = left
 * @returns New array of [lat, lon] coordinates offset from original
 */
export function offsetRoute(
  coords: [number, number][],
  offsetMeters: number
): [number, number][] {
  if (!coords || coords.length < 2) return coords;

  const offsetCoords: [number, number][] = [];

  for (let i = 0; i < coords.length; i++) {
    let prev = coords[Math.max(i - 1, 0)];
    let next = coords[Math.min(i + 1, coords.length - 1)];

    const p1 = L.latLng(prev[0], prev[1]);
    const p2 = L.latLng(next[0], next[1]);

    // Compute direction vector
    const dx = p2.lng - p1.lng;
    const dy = p2.lat - p1.lat;

    // Normalize perpendicular vector
    const length = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / length;
    const perpY = dx / length;

    // Offset using meters -> degrees
    const offsetLat = (offsetMeters / 111320) * perpY; // rough meter-to-degree
    const offsetLng = (offsetMeters / (111320 * Math.cos(p1.lat * (Math.PI / 180)))) * perpX;

    offsetCoords.push([coords[i][0] + offsetLat, coords[i][1] + offsetLng]);
  }

  return offsetCoords;
}
