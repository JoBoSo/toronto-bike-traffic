// utils/torontoOpenDataApi/TorontoOpenDataClient.ts
import { ApiResponse, PackageResult, ResourceMetadata } from "../types/torontoOpenData";

export class TorontoOpenDataClient {
  private readonly baseUrl = "https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action";

  constructor() {}

  /** Generic GET request with robust error handling */
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, options);

    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;

      try {
        const errorBody = await response.clone().json();
        errorMessage = (errorBody as any).message || (errorBody as any).error || JSON.stringify(errorBody);
      } catch {
        try {
          const text = await response.text();
          if (text) errorMessage += `. Body: ${text.substring(0, 100)}...`;
        } catch {}
      }

      throw new Error(`Failed to fetch data from ${url}: ${errorMessage}`);
    }

    return await response.json();
  }

  /** Fetch package metadata */
  async getPackageMetadata(packageId: string): Promise<PackageResult> {
    const url = `${this.baseUrl}/package_show?id=${packageId}`;
    const response: ApiResponse<PackageResult> = await this.get<ApiResponse<PackageResult>>(url);
    return response.result;
  }

  /** Fetch metadata for a specific resource */
  async getResourceMetadata(packageId: string, resourceName: string): Promise<ResourceMetadata | undefined> {
    const pkg = await this.getPackageMetadata(packageId);
    return pkg.resources.find((r) => r.name === resourceName);
  }

  /** Get the URL for a resource */
  async getResourceUrl(packageId: string, resourceName: string): Promise<string | undefined> {
    const resource = await this.getResourceMetadata(packageId, resourceName);
    return resource?.url;
  }

  /** Fetch data from a resource */
  async getResourceData<T = unknown>(packageId: string, resourceName: string): Promise<T | undefined> {
    const url = await this.getResourceUrl(packageId, resourceName);
    if (!url) return undefined;
    return await this.get<T>(url);
  }
}

async function main() {
  const torontoOpenDataClient = new TorontoOpenDataClient();
  const data = await torontoOpenDataClient.getPackageMetadata("cycling-network");
  console.log(data);
}
// main();