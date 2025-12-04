import { TorontoOpenDataClient } from "./TorontoOpenDataClient";
import { PackageResult, ResourceMetadata } from "../types/torontoOpenData";

export class PermanentBicycleCountersPkgClient extends TorontoOpenDataClient {
  private readonly packageId: string;

  constructor(packageId: string = "permanent-bicycle-counters") {
    super();
    this.packageId = packageId;
  }

  /** Fetch metadata for the cycling network package */
  public async getPkgMetadata(): Promise<PackageResult> {
    return this.getPackageMetadata(this.packageId);
  }

  /** Fetch metadata for a specific resource within the cycling network package */
  public async getResrcMetadata(resourceName: string): Promise<ResourceMetadata | undefined> {
    return super.getResourceMetadata(this.packageId, resourceName);
  }

  /** Fetch the GeoJSON data for the cycling network */
  public async getCounterLocations(): Promise<any> {
    const response: any = await super.getResourceData(this.packageId, 'cycling_permanent_counts_locations_geojson');
    return response.features;
  }

  public async getDailyCounts(): Promise<any> {
    return super.getResourceData(this.packageId, 'cycling_permanent_counts_daily.json');
  }

  public async get15MinCounts2025To2026(): Promise<any> {
    return super.getResourceData(this.packageId, 'cycling_permanent_counts_15min_2025_2026.json');
  }

  async sumByGrouping(data: any, groupByKey: string, sumKey: string) {
    const groupedByKey: any = Object.groupBy(data, (item: any) => item[groupByKey]);
    const summedData = [];
    for (const group in groupedByKey) {
        const summed = groupedByKey[group].reduce(((sum: any, item: any) => sum + item[sumKey]), 0);
        const sumKeyName = `sum_${sumKey}`;
        summedData.push({[groupByKey]: group, [sumKeyName]: summed});
    }
    // console.log(summedData);
    return summedData;
  }

  public async getAnnualCountsByLocation(): Promise<any> {
    const data = await this.getDailyCounts();
    const aggregated = this.sumByGrouping(data, 'location_dir_id', 'daily_volume');
    return aggregated;
  }

}

// Example usage:
async function main() {
  const pbClient = new PermanentBicycleCountersPkgClient();
  // const data = await pbClient.getPkgMetadata();
  const data = await pbClient.getAnnualCountsByLocation();
  console.log(data);
}
main()
