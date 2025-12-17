export default interface DailyCountsByLocNameInDateRangeResponse {
  /** * A dynamic map where the key is a date string 
   * (e.g., "Fri, 01 Aug 2025 00:00:00 GMT")
   */
  [dateString: string]: DailyLocationCount[];
}

export interface DailyLocationCount {
  name: string;
  daily_volume: number;
  /** Represented as stringified array, e.g., "[-79.49, 43.64]" */
  coordinates: string;
  /** Represented as stringified array, e.g., "[12, 13]" */
  location_dir_ids: string;
}