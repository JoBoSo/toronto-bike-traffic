import { CounterLocationFeature } from "@/src/interfaces/counterLocationTypes";

export function getCounterCoords(
  locationDirId: number, 
  counterLocGeoJson: CounterLocationFeature[]
): [number, number] {
  const counter = counterLocGeoJson.find((item: CounterLocationFeature) => 
    item.properties.location_dir_id === locationDirId
  );
  
  if (!counter?.geometry?.coordinates) {
    throw new Error(`No coordinates found for locationDirId ${locationDirId}`);
  }

  return counter.geometry.coordinates as [number, number];
};