import pThrottle from 'p-throttle';

/**
 * Fetch a cycling route from start to end following main roads
 * using OSRM public API (or your own server).
 *
 * @param start [lon, lat] start coordinate
 * @param end [lon, lat] end coordinate
 * @param avoidSidestreets boolean, if true, tries to avoid minor roads
 * @returns array of [lat, lon] coordinates along the route
 */
export async function getRoute(
  start: [number, number],
  end: [number, number],
  avoidSidestreets: boolean = true
): Promise<[number, number][]> {
  const baseUrl = "https://router.project-osrm.org";
  const profile = "cycling";
  
  const coordinates = `${start[0]},${start[1]};${end[0]},${end[1]}`;

  // OSRM query params
  const params = new URLSearchParams({
    overview: "full",       // return all points
    geometries: "geojson",  // GeoJSON coords
    steps: "false",         // no detailed turn-by-turn instructions
    alternatives: "false",  // only one route
  });

  // Optionally avoid minor roads or footways
  // if (avoidSidestreets) {
  //   // exclude footways, steps, etc.
  //   params.append("exclude", "footway,service,track,path");
  // }

  const url = `${baseUrl}/route/v1/${profile}/${coordinates}?${params.toString()}`;

  const response = await fetchWithTimeout(url, 30000);
  if (!response.ok) {
    throw new Error(`OSRM request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.code !== "Ok" || !data.routes || !data.routes[0]?.geometry?.coordinates) {
    throw new Error("No route found or invalid response from OSRM");
  }

  // OSRM returns [lon, lat], convert to [lat, lon] for Leaflet
  const routeCoords: [number, number][] = data.routes[0].geometry.coordinates.map(
    ([lon, lat]: [number, number]) => [lat, lon]
  );

  return routeCoords;
}

export async function fetchWithTimeout(url: string, timeoutMs = 5000) {
  return Promise.race([
    fetch(url),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Fetch timed out")), timeoutMs)
    ),
  ]);
}

// Throttle configuration: 1 call per 500 milliseconds
const throttle = pThrottle({
  limit: 1,           // Max concurrent calls
  interval: 700,     // Per milliseconds
  strict: true        // Ensure delay even if previous call finished faster
});

export const getRouteThrottled = throttle(getRoute);
