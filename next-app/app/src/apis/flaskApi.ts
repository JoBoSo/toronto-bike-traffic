import { get } from "./apiDataFetcher";
import { FifteenMinCountsResponse } from '@/src/interfaces/flaskApiResponseTypes';

const BASE_URL = process.env.NEXT_PUBLIC_FLASK_BASE_URL;

export class FlaskApi {
  private readonly baseUrl = BASE_URL;

  async get15MinCountsInDateRange(
    startDate: string, 
    endDate: string
  ): Promise<FifteenMinCountsResponse> {
    console.log(this.baseUrl)
    const url = this.baseUrl + `/fifteen-min-counts-in-date-range?start=${startDate}&end=${endDate}`;
    const data = await get<FifteenMinCountsResponse>(url);
    return data;
  }

  async getDailyCountsInDateRange(
    startDate: string, endDate: string
  ): Promise<Array<{ location_dir_id: string; avg_daily_volume: number }>> {
    const url = this.baseUrl + `/daily-counts-in-date-range?start=${startDate}&end=${endDate}`;
    const data = await get<Array<{ location_dir_id: string; avg_daily_volume: number }>>(url);
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