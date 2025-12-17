export default interface CounterLocationResponse {
    type: "FeatureCollection";
    features: CyclingCounterFeature[];
}

export interface CyclingCounterFeature {
    type: "Feature";
    id: number;
    geometry: PointGeometry;
    properties: CyclingCounterProperties;
}

export interface PointGeometry {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
}

export interface CyclingCounterProperties {
    bin_size: string;
    centreline_id: number;
    date_decommissioned: string | null;
    direction: "Northbound" | "Southbound" | "Eastbound" | "Westbound";
    first_active: string;
    last_active: string;
    latest_calibration_study: string | null;
    linear_name_full: string;
    location_dir_id: number;
    location_name: string;
    side_street: string;
    technology: string;
}