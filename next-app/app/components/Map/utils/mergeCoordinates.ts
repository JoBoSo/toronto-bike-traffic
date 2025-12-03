// Attach coordinates from dataset A to dataset B based on location_dir_id
export default function mergeCoordinates(
  counterLocationData: any[],
  dataNeedingCoords: any[]
) {
  if (!counterLocationData || !dataNeedingCoords) return [];

  // Build coordinate lookup map (no JSON.parse needed)
  const coordMap = new Map(
    counterLocationData.map((item: any) => [
      String(item.properties.location_dir_id),
      item.geometry.coordinates,   // already [lon, lat]
    ])
  );

  // Merge into fifteenMinData
  return dataNeedingCoords.map((row: any) => {
    const key = String(row.location_dir_id);
    const coords = coordMap.get(key) || null;

    return {
      ...row,
      coordinates: coords ? [coords[1], coords[0]] : null, // Leaflet wants [lat, lon]
    };
  });
}