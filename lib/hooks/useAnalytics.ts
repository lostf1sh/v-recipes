"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  TimeRange,
  AnalyticsData,
  DataPoint,
  HourlyDataPoint,
  HTTPVersionEntry,
  RangeDataResponse,
  ActiveUsersResponse,
  CountriesResponse,
  PathsResponse,
  TopIPsResponse,
  HTTPVersionsResponse,
  MultiRangeData,
  IPDetails,
} from "@/lib/types";

const API_BASE = "/api/analytics";
const POLL_INTERVAL = 60_000;

async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    return null;
  }
}

function normalizeHTTPVersions(
  versions: Record<string, { requests: number; percentage: number }> | undefined
): HTTPVersionEntry[] {
  if (!versions || typeof versions !== "object") return [];
  return Object.entries(versions).map(([version, v]) => ({
    version,
    requests: v.requests,
    percentage: v.percentage,
  }));
}

function normalizeHourlyData(points: HourlyDataPoint[] | undefined): DataPoint[] {
  if (!Array.isArray(points)) return [];
  return points.map((p) => ({
    timestamp: p.hour,
    requests: p.requests,
    data_served: p.bytes,
    data_cached: p.cachedBytes,
  }));
}

const EMPTY: AnalyticsData = {
  timeSeries: [],
  activeUsers: 0,
  countries: [],
  paths: [],
  topIPs: [],
  httpVersions: [],
  totalRequests: 0,
  totalDataServed: 0,
  totalDataCached: 0,
  cachedPercentage: 0,
};

export function useAnalytics(range: TimeRange) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track which range the current data belongs to
  const dataRangeRef = useRef<TimeRange | null>(null);

  const fetchData = useCallback(
    async (signal: AbortSignal, isRefresh: boolean) => {
      try {
        const useMultiRange = range === "6h" || range === "12h" || range === "15h";

        // Fetch all endpoints independently - partial failure is OK
        const [timeSeriesRaw, activeUsersRes, countriesRes, pathsRes, topIPsRes, httpVersionsRes] =
          await Promise.all([
            useMultiRange
              ? fetchJSON<MultiRangeData>(`${API_BASE}/data`, signal)
              : range === "24h"
                ? fetchJSON<RangeDataResponse>(`${API_BASE}/data24h`, signal)
                : fetchJSON<RangeDataResponse>(`${API_BASE}/data7d`, signal),
            fetchJSON<ActiveUsersResponse>(`${API_BASE}/active-users?range=${range}`, signal),
            fetchJSON<CountriesResponse>(`${API_BASE}/countries?range=${range}`, signal),
            fetchJSON<PathsResponse>(`${API_BASE}/paths?range=${range}`, signal),
            fetchJSON<TopIPsResponse>(`${API_BASE}/topips?range=${range}`, signal),
            fetchJSON<HTTPVersionsResponse>(`${API_BASE}/http-versions?range=${range}`, signal),
          ]);

        if (signal.aborted) return;

        // Extract range data safely
        let rangeData: RangeDataResponse | null = null;
        if (useMultiRange && timeSeriesRaw) {
          rangeData = (timeSeriesRaw as MultiRangeData)[range] ?? null;
        } else if (timeSeriesRaw) {
          rangeData = timeSeriesRaw as RangeDataResponse;
        }

        const timeSeries = normalizeHourlyData(rangeData?.hourlyData);

        const newData: AnalyticsData = {
          timeSeries,
          activeUsers: activeUsersRes?.totalUniqueIPs ?? 0,
          countries: countriesRes?.countries ?? [],
          paths: pathsRes?.paths ?? [],
          topIPs: topIPsRes?.topIPs ?? [],
          httpVersions: normalizeHTTPVersions(httpVersionsRes?.versions),
          totalRequests: rangeData?.totalRequests ?? 0,
          totalDataServed: rangeData?.totalDataServed ?? 0,
          totalDataCached: rangeData?.totalCachedBytes ?? 0,
          cachedPercentage: rangeData?.percentCached ?? 0,
        };

        // Check if we got ANY real data
        const hasData =
          timeSeries.length > 0 ||
          newData.activeUsers > 0 ||
          newData.countries.length > 0;

        if (!hasData && !isRefresh) {
          setError("No analytics data available for this time range.");
        } else {
          setError(null);
        }

        dataRangeRef.current = range;
        setData(newData);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // On refresh failure, keep existing data
        if (!isRefresh) {
          setError("Failed to fetch analytics data.");
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [range]
  );

  useEffect(() => {
    // Abort previous
    abortRef.current?.abort();
    if (intervalRef.current) clearInterval(intervalRef.current);

    const controller = new AbortController();
    abortRef.current = controller;

    // Clear stale data when range changes so we don't show wrong range's data
    if (dataRangeRef.current !== null && dataRangeRef.current !== range) {
      setData(null);
    }
    setLoading(true);
    setError(null);

    fetchData(controller.signal, false);

    intervalRef.current = setInterval(() => {
      fetchData(controller.signal, true);
    }, POLL_INTERVAL);

    return () => {
      controller.abort();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, range]);

  return { data, loading, error };
}

export function useIPDetails(ip: string | null, range: TimeRange) {
  const [details, setDetails] = useState<IPDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ip) {
      setDetails(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`${API_BASE}/ipdetails?ip=${encodeURIComponent(ip)}&range=${range}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!controller.signal.aborted) setDetails(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setDetails(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [ip, range]);

  return { details, loading };
}
