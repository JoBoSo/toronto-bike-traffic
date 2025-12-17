export interface DailyLocationVolume {
    daily_volume: number; 
    location_dir_id: string;
}

export default interface DailyCountsResponse {
    [dateString: string]: DailyLocationVolume[];
}