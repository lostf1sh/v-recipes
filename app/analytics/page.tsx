"use client";

import { useState } from "react";
import type { TimeRange } from "@/lib/types";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { MetricCards } from "@/components/features/analytics/MetricCards";
import { TimeRangeTabs } from "@/components/features/analytics/TimeRangeTabs";
import { RequestsChart } from "@/components/features/analytics/RequestsChart";
import { DataServedChart } from "@/components/features/analytics/DataServedChart";
import { HTTPVersionBars } from "@/components/features/analytics/HTTPVersionBars";
import { CountryBars } from "@/components/features/analytics/CountryBars";
import { PathsList } from "@/components/features/analytics/PathsList";
import { TopIPsList } from "@/components/features/analytics/TopIPsList";
import { AnalyticsSkeleton } from "@/components/features/analytics/AnalyticsSkeleton";

export default function AnalyticsPage() {
  const [range, setRange] = useState<TimeRange>("7d");
  const { data, loading, error } = useAnalytics(range);

  // Show skeleton when loading without data (initial load or range change)
  const showSkeleton = loading && !data;
  // Show overlay refresh indicator when reloading with existing data
  const showRefreshing = loading && !!data;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      {/* Header */}
      <div
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-up"
        style={{ animationDelay: "0ms" }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#ededed]">
            Real-time DNS Analytics
          </h1>
          <p className="mt-1 text-sm text-[#888888]">
            Monitor your DNS traffic, performance metrics, and usage patterns in real time.
          </p>
        </div>
        <TimeRangeTabs selected={range} onChange={setRange} disabled={showSkeleton} />
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Skeleton while no data */}
      {showSkeleton && <AnalyticsSkeleton />}

      {/* Dashboard content */}
      {data && (
        <div className={`space-y-6 ${showRefreshing ? "opacity-70 pointer-events-none" : ""} transition-opacity duration-200`}>
          <MetricCards
            activeUsers={data.activeUsers}
            totalRequests={data.totalRequests}
            totalDataServed={data.totalDataServed}
            totalDataCached={data.totalDataCached}
            cachedPercentage={data.cachedPercentage}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <RequestsChart data={data.timeSeries} />
            <DataServedChart data={data.timeSeries} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <HTTPVersionBars data={data.httpVersions} />
            <CountryBars data={data.countries} />
          </div>

          <PathsList data={data.paths} />

          <TopIPsList data={data.topIPs} range={range} />
        </div>
      )}

      {/* Status bar */}
      <p className="mt-6 text-center text-xs text-[#555555]">
        {showRefreshing ? (
          <>
            <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-[#3f83f8]" />
            Refreshing...
          </>
        ) : data ? (
          "Auto-refreshes every 60 seconds"
        ) : null}
      </p>
    </div>
  );
}
