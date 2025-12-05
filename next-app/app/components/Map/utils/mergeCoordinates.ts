import { FifteenMinCountsResponse, LocationAverage } from '@/src/interfaces/flaskApiResponseTypes';
import { CounterLocationFeature } from '@/src/interfaces/counterLocationTypes';

/**
 * Attaches coordinates from the CounterLocationFeature dataset to the aggregated 
 * volume data based on matching 'location_dir_id'.
 * * NOTE: This function expects to receive the CounterLocationFeature[] array (the GeoJSON features) 
 * and the entire FifteenMinCountsResponse object. It returns a similarly structured 
 * object, but with coordinates added to the nested LocationAverage objects.
 * * @param counterLocationData An array of GeoJSON features for counter locations.
 * @param dataNeedingCoords The aggregated volume data keyed by time bin.
 * @returns A structured object (FifteenMinCountsResponse) with coordinates added 
 * to each nested LocationAverage record.
 */
export default function mergeCoordinates(
    counterLocationData: CounterLocationFeature[],
    dataNeedingCoords: FifteenMinCountsResponse
): FifteenMinCountsResponse {
    if (!counterLocationData || !dataNeedingCoords) return {};

    // 1. Build coordinate lookup map: Map<string, [lon, lat]>
    const coordMap = new Map<string, [number, number]>(
        counterLocationData.map((item: CounterLocationFeature) => [
            String(item.properties.location_dir_id),
            item.geometry.coordinates, // already [lon, lat]
        ])
    );

    const mergedData: FifteenMinCountsResponse = {};

    // 2. Iterate over the time bins (keys of the response object)
    for (const timeBin in dataNeedingCoords) {
        if (dataNeedingCoords.hasOwnProperty(timeBin)) {
            const locationsInBin: LocationAverage[] = dataNeedingCoords[timeBin];
            
            // 3. Process the array of LocationAverage records for this time bin
            const mergedLocations = locationsInBin.map(locationRow => {
                const key = String(locationRow.location_dir_id);
                // coords is [lon, lat]
                const coords = coordMap.get(key) || null; 

                // We must create a new object type here to include coordinates,
                // as LocationAverage does not contain them by definition.
                return {
                    ...locationRow,
                    // Leaflet/frontend typically wants [lat, lon], so reverse coords
                    coordinates: coords ? [coords[1], coords[0]] : null, 
                };
            });

            // 4. Assign the new array back to the time bin key
            // NOTE: TypeScript warns because the inner type is technically enhanced, 
            // but we cast it as the original interface for structural return.
            mergedData[timeBin] = mergedLocations as LocationAverage[];
        }
    }

    return mergedData;
}