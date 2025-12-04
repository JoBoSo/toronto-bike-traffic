import { get } from "./apiDataFetcher";

export class FlaskApi {
  private readonly baseUrl = "http://127.0.0.1:5000/api/v1";

  async get15MinCountsForDateRange(
    startDate: string, 
    endDate: string
  ): Promise<Array<{ 
    location_dir_id: string; 
    time: string; 
    avg_vol: number;
  }>> {
    const url = this.baseUrl + `/fifteen-min-counts-for-date-range?start=${startDate}&end=${endDate}`;
    const data = await get<Array<{ 
      location_dir_id: string; 
      time: string; 
      avg_vol: number;
    }>>(url);
    return data;
  }

  async getAvgDailyVolForDateRange(
    startDate: string, endDate: string
  ): Promise<Array<{ location_dir_id: string; avg_daily_volume: number }>> {
    const url = this.baseUrl + `/avg-daily-vol-for-date-range?start=${startDate}&end=${endDate}`;
    const data = await get<Array<{ location_dir_id: string; avg_daily_volume: number }>>(url);
    return data;
}

}

// example usage
async function main() {
  const flaskApi = new FlaskApi();
  const data = await flaskApi.getAvgDailyVolForDateRange("2023-01-01", "2023-01-31");
  // const data = await flaskApi.get15MinCountsByYearAndMonth("2023", "05");
  console.log(data);
}
// main()