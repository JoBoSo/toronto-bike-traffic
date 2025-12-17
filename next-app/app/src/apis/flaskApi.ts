import { get } from "@/src/apis/apiDataFetcher";
import FifteenMinCountsResponse from '@/src/interfaces/flaskApiResponseTypes/FifteenMinCountsResponse';
import CounterLocationResponse from '@/src/interfaces/flaskApiResponseTypes/CounterLocationResponse';
import DailyCountsResponse from '@/src/interfaces/flaskApiResponseTypes/DailyCountsResponse';
import CounterGroupsResponse from '@/src/interfaces/flaskApiResponseTypes/CounterGroupsResponse';
import FifteenMinCountsByLocNameResponse from '@/src/interfaces/flaskApiResponseTypes/FifteenMinCountsByLocNameResponse';
import DailyCountsByLocNameInDateRangeResponse from '@/src/interfaces/flaskApiResponseTypes/DailyCountsByLocNameInDateRangeResponse';

const BASE_URL = process.env.NEXT_PUBLIC_FLASK_BASE_URL;

export class FlaskApi {
  private readonly baseUrl = BASE_URL;

  async getCounterLocations(
    locationDirId: string = ""
  ): Promise<CounterLocationResponse> {
    const url = this.baseUrl + `/counter-locations?location_dir_id=${locationDirId}`;
    const data = await get<CounterLocationResponse>(url);
    return data;
  }

  async getCounterGroups(): Promise<CounterGroupsResponse> {
    const url = this.baseUrl + `/counter-groups`;
    const data = await get<CounterGroupsResponse>(url);
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

  async get15MinCountsByLocNameInDateRange(
    startDate: string, 
    endDate: string
  ): Promise<FifteenMinCountsByLocNameResponse> {
    const url = this.baseUrl + `/fifteen-min-counts-by-location-name-in-date-range?start=${startDate}&end=${endDate}`;
    const data = await get<FifteenMinCountsByLocNameResponse>(url);
    return data;
  }

  async getDailyCountsInDateRange(
    startDate: string, 
    endDate: string
  ): Promise<DailyCountsResponse> {
    const url = this.baseUrl + `/daily-counts-in-date-range?start=${startDate}&end=${endDate}`;
    const data = await get<DailyCountsResponse>(url);
    return data;
  }

  async getDailyCountsByLocNameInDateRange(
    startDate: string, 
    endDate: string
  ): Promise<DailyCountsByLocNameInDateRangeResponse> {
    const url = this.baseUrl + `/daily-counts-by-location-name-in-date-range?start=${startDate}&end=${endDate}`;
    const data = await get<DailyCountsByLocNameInDateRangeResponse>(url);
    return data;
  }

}
