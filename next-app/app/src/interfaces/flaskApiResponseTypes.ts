export interface LocationAverage {
  location_dir_id: string; 
  avg_bin_volume: number;
}

export interface FifteenMinCountsResponse {
  [timeBin: string]: LocationAverage[];
}