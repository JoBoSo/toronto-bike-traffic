import { CounterPolyline } from "./renderPolylines";
import { Polyline } from "leaflet";

export function getCounterPolyline(
  locationDirId: number, counterPolylines: CounterPolyline[]
): Polyline | undefined {
  const matchingItem = counterPolylines.find(
    (item) => item.locationDirId === locationDirId
  );
  return matchingItem?.polyline
};