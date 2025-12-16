import { get } from "../apiDataFetcher";
import { 
  FifteenMinCountsResponse,
  DailyCountsResponse,
} from '@/src/interfaces/flaskApiResponseTypes';

const BASE_URL = process.env.NEXT_PUBLIC_FLASK_BASE_URL;

export class FlaskApi {
  private readonly baseUrl = BASE_URL;

  async getCounterLocations(
    locationDirId: string = ""
  ): Promise<FifteenMinCountsResponse> {
    const url = this.baseUrl + `/counter-locations?location_dir_id=${locationDirId}`;
    const data = await get<any>(url);
    return data;
  }

  async get15MinCountsInDateRange(
    startDate: string, 
    endDate: string
  ): Promise<FifteenMinCountsResponse> {
    const url = this.baseUrl + `/fifteen-min-counts-in-date-range?start=${startDate}&end=${endDate}`;
    const data = await get<FifteenMinCountsResponse>(url);
    return data;
  }

  async getDailyCountsInDateRange(
    startDate: string, endDate: string
  ): Promise<DailyCountsResponse> {
    const url = this.baseUrl + `/daily-counts-in-date-range?start=${startDate}&end=${endDate}`;
    const data = await get<DailyCountsResponse>(url);
    return data;
  }

}
