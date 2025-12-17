export default interface CounterGroupsResponse {
  type: "FeatureCollection";
  features: CounterGroupFeature[];
}

export interface CounterGroupFeature {
  type: "Feature";
  id: string; // Note: Your log shows id as a string "1"
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: CounterGroupProperties;
}

export interface CounterGroupProperties {
  name: string;
  directions: string;      // e.g., "Westbound, Eastbound"
  location_dir_ids: string; // e.g., "1, 2"
  first_active: string;     // ISO format: "1994-06-26T00:00:00.000"
  last_active: string;      // ISO format: "2019-06-13T00:00:00.000"
}