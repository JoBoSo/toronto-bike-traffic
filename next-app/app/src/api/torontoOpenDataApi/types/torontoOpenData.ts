// types/torontoOpenData.ts
export interface ResourceMetadata {
  id: string;
  name: string;
  url: string;
  datastore_active: boolean;
  [key: string]: unknown;
}

export interface PackageResult {
  resources: ResourceMetadata[];
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  result: T;
  [key: string]: unknown;
}
