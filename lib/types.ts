// Analytics API response types — aligned with actual v.recipes API

export type TimeRange = "6h" | "12h" | "15h" | "24h" | "7d";

// Hourly data point from API
export interface HourlyDataPoint {
  hour: string;
  requests: number;
  bytes: number;
  cachedBytes: number;
  cachedRequests: number;
}

// Normalized data point for charts
export interface DataPoint {
  timestamp: string;
  requests: number;
  data_served: number;
  data_cached: number;
}

// Single range response from /data, /data24h, /data7d
export interface RangeDataResponse {
  totalRequests: number;
  totalDataServed: number;
  totalCachedBytes: number;
  totalCachedRequests: number;
  percentCached: number;
  range: string;
  hourlyData: HourlyDataPoint[];
}

// Multi-range response from /data endpoint
export interface MultiRangeData {
  "6h": RangeDataResponse;
  "12h": RangeDataResponse;
  "15h": RangeDataResponse;
}

// Active users response
export interface ActiveUsersResponse {
  totalUniqueIPs: number;
  range: string;
}

// Country entry from /countries
export interface CountryEntry {
  name: string;       // country code e.g. "CN"
  requests: number;
  bytes: number;
}

// Countries response wrapper
export interface CountriesResponse {
  range: string;
  countries: CountryEntry[];
}

// Path entry from /paths
export interface PathEntry {
  path: string;
  requests: number;
  bytes: number;
}

// Paths response wrapper
export interface PathsResponse {
  range: string;
  paths: PathEntry[];
}

// Top IP entry from /topips
export interface TopIPEntry {
  ip: string;         // masked IP
  originalIP: string;
  count: number;
  rank: number;
}

// Top IPs response wrapper
export interface TopIPsResponse {
  topIPs: TopIPEntry[];
}

// IP details from /ipdetails
export interface IPDetails {
  ip: string;
  sampledCount: number;
  asn: string;
  asnDesc: string;
  country: string;
  paths: { path: string; count: number }[];
  colos: string[];
}

// HTTP version entry (normalized for UI)
export interface HTTPVersionEntry {
  version: string;
  requests: number;
  percentage: number;
}

// Raw HTTP version entry from API
export interface HTTPVersionRaw {
  requests: number;
  percentage: number;
}

// HTTP versions response wrapper
export interface HTTPVersionsResponse {
  totalRequests: number;
  versions: Record<string, HTTPVersionRaw>;
  range: string;
}

// Per-IP usage data from /dataperip
export interface DataPerIPPathStat {
  count: number;
  methods: string[];
  protocols: string[];
  cacheHits: number;
  cacheMisses: number;
  lastAccessed: string;
  cacheHitRate: string;
}

export interface DataPerIPResponse {
  totalRequests: number;
  uniquePathsCount: number;
  pathStats: Record<string, DataPerIPPathStat>;
  range: string;
  clientIP: string;
  clientASN: string;
  clientASNDescription: string;
  dataCollectedAt: string;
}

// Aggregated dashboard state
export interface AnalyticsData {
  timeSeries: DataPoint[];
  activeUsers: number;
  countries: CountryEntry[];
  paths: PathEntry[];
  topIPs: TopIPEntry[];
  httpVersions: HTTPVersionEntry[];
  totalRequests: number;
  totalDataServed: number;
  totalDataCached: number;
  cachedPercentage: number;
}
