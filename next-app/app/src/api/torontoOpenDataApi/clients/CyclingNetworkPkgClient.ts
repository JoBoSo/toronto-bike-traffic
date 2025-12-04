import { TorontoOpenDataClient } from "./TorontoOpenDataClient";
import { PackageResult, ResourceMetadata } from "../types/torontoOpenData";

export class CyclingNetworkPkgClient extends TorontoOpenDataClient {
  private readonly packageId: string;

  constructor(packageId: string = "cycling-network") {
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
  public async getGeoJson(): Promise<any> {
    const response: any = await super.getResourceData(this.packageId, 'cycling-network - 4326.geojson');
    return response.features;
  }
}

// Example usage:
async function main() {
  const cyclingClient = new CyclingNetworkPkgClient();
  // const data = await cyclingClient.getPkgMetadata();
  const data = await cyclingClient.getGeoJson();
  console.log(data);
}
// main()
