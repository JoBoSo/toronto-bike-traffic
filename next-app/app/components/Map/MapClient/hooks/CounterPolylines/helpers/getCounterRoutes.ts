import { CounterLocationFeature } from "@/src/interfaces/counterLocationTypes";
import { getCounterCoords } from "./getCounterCoords";
import { getRoute, getRouteThrottled } from "./getRoute";
import { offsetRoute } from "./offsetRoute";

export interface CounterRouteDef {
  locationDirId: number;
  endPoint: [number, number];
};

export interface CounterRoute {
  locationDirId: number;
  routeCoords: [number, number][];
};

export async function getCounterRoutes(
  counterLocations: CounterLocationFeature[]
): Promise<CounterRoute[]> {
  const COUNTER_ROUTES: CounterRouteDef[] = [
    {locationDirId: 4, endPoint: getCounterCoords(13, counterLocations)}, //westbound
    {locationDirId: 5, endPoint: getCounterCoords(26, counterLocations)}, //eastbound
    {locationDirId: 6, endPoint: getCounterCoords(9, counterLocations)}, //westbound
    {locationDirId: 8, endPoint: getCounterCoords(5, counterLocations)}, //eastbound
    {locationDirId: 9, endPoint: getCounterCoords(4, counterLocations)}, //westbound
    {locationDirId: 23, endPoint: getCounterCoords(19, counterLocations)},
    {locationDirId: 29, endPoint: getCounterCoords(27, counterLocations)}, // southbound
    {locationDirId: 31, endPoint: getCounterCoords(29, counterLocations)}, // southbound
    {locationDirId: 33, endPoint: getCounterCoords(31, counterLocations)}, // southbound
    {locationDirId: 35, endPoint: getCounterCoords(33, counterLocations)}, // southbound
  ];

  const routePromises = COUNTER_ROUTES.map((routeDef: CounterRouteDef) => {
    const startCoord = getCounterCoords(routeDef.locationDirId, counterLocations);
    const endCoord = routeDef.endPoint; 
    return getRouteThrottled(startCoord, endCoord).then(resolvedCoords => {
      return {
        locationDirId: routeDef.locationDirId,
        routeCoords: resolvedCoords
      } as CounterRoute;
    });
  });

  const routes: CounterRoute[] = await Promise.all(routePromises);

  return routes;
}