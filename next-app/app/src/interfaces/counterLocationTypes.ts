
// 1. Define the structure for the GeoJSON properties object
export interface CounterLocationProperties {
    bin_size: string;
    centreline_id: number;
    date_decommissioned: string | null;
    direction: string;
    first_active: string;
    last_active: string;
    latest_calibration_study: string | null;
    linear_name_full: string;
    location_dir_id: number;
    location_name: string;
    side_street: string;
    technology: string;
}

// 2. Define the GeoJSON Feature structure for a single counter location
export interface CounterLocationFeature {
    type: "Feature";
    id: number;
    geometry: {
        type: "Point";
        // Coordinates in GeoJSON are typically [longitude, latitude]
        coordinates: [number, number]; 
    };
    properties: CounterLocationProperties;
}
