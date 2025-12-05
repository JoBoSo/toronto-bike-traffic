export interface LocationAverage {
  location_dir_id: string; 
  avg_bin_volume: number;
}

export interface FifteenMinCountsResponse {
  [timeBin: string]: LocationAverage[];
}

export interface DailyLocationVolume {
    daily_volume: number; 
    location_dir_id: string;
}

export interface DailyCountsResponse {
    [dateString: string]: DailyLocationVolume[];
}