/**
 * Defines the GeoJSON structure for the Cycling Network data, 
 * which uses MultiLineString geometry.
 */

// 1. Define the structure for the GeoJSON properties object
export interface cyclingNetworkProperties {
  _id: number;
  cnp_class: string;
  converted: string;
  dir_loworder: string;
  from_street: string;
  infra_high_order: string;
  infra_low_order: string;
  installed: number;
  owner: string;
  pre_amalgamation: string;
  road_class: string;
  segment_id: number;
  street_name: string;
  surface: string;
  to_street: string;
  upgraded: number;
}

// 2. Define the GeoJSON Geometry structure for a MultiLineString
/**
 * Represents a single coordinate pair [longitude, latitude].
 * GeoJSON standard uses [longitude, latitude].
 */
type GeoJsonCoordinate = [number, number];

/**
 * GeoJSON MultiLineString Coordinates: an array of LineStrings.
 * (e.g., [ [ [lon, lat], [lon, lat] ], [ [lon, lat] ] ])
 */
type GeoJsonMultiLineStringCoordinates = GeoJsonCoordinate[][];

export interface geoJsonMultiLineStringGeometry {
  type: "MultiLineString";
  coordinates: GeoJsonMultiLineStringCoordinates;
}

// 3. Define the GeoJSON Feature structure for a single network segment
export interface CyclingNetworkFeature {
  type: "Feature";
  geometry: geoJsonMultiLineStringGeometry;
  properties: cyclingNetworkProperties;
}