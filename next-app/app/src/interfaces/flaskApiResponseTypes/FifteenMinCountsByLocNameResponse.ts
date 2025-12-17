export default interface FifteenMinCountsByLocNameResponse {
  /** * A dynamic map where the key is the time (HH:mm:ss) 
   * and the value is an array of count data for that time slice.
   */
  [time: string]: LocationCountBin[];
}

export interface LocationCountBin {
  name: string;
  avg_bin_volume: number;
  /** Represented as a stringified array, e.g., "[-79.49, 43.64]" */
  coordinates: string; 
  /** Represented as a stringified array, e.g., "[12, 13]" */
  location_dir_ids: string; 
}