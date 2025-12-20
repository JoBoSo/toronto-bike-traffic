// helpers/renderPolylinesToMap.ts

import L, { Map as LeafletMap, Polyline } from "leaflet";
import { CounterRoute } from "@/components/Map/AnimatedCounterPolylines/helpers/getCounterRoutes";

const POLYLINE_PANE_NAME = "counterPolylinePane";

export interface CounterPolyline {
  locationDirId: number;
  polyline: Polyline;
};

/**
 * Creates and adds polylines to the Leaflet map instance.
 *
 * @param mapInstance The active Leaflet map instance.
 * @param paneName The name of the pane the routes are on.
 * @param routes The geographical coordinates for the routes.
 * @returns An array containing the created Leaflet Polyline instances.
 */
export function renderPolylines(
  mapInstance: LeafletMap,
  routes: CounterRoute[],
  paneName: string = POLYLINE_PANE_NAME,
): CounterPolyline[] {
  const counterPolylines: CounterPolyline[] = [];

  for (const route of routes) {
    const polyline = L.polyline(route.routeCoords, {
      pane: paneName,
      // default styling without animation
      color: "#000000ff",
      weight: 4,
      opacity: 0,
    }).addTo(mapInstance);

    counterPolylines.push({locationDirId: route.locationDirId, polyline: polyline});
  };

  return counterPolylines;
}