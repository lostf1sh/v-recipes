"use client";

import { cn } from "@/lib/cn";
import { formatNumber, formatBytes } from "@/lib/format";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
}

function MetricCard({ label, value, subtitle, accent }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-[#555555]">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tabular-nums tracking-tight",
          accent ? "text-[#3f83f8]" : "text-[#ededed]"
        )}
      >
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-[#555555]">{subtitle}</p>
      )}
    </div>
  );
}

interface MetricCardsProps {
  activeUsers: number;
  totalRequests: number;
  totalDataServed: number;
  totalDataCached: number;
  cachedPercentage: number;
}

export function MetricCards({
  activeUsers,
  totalRequests,
  totalDataServed,
  totalDataCached,
  cachedPercentage,
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <MetricCard
        label="Active Users"
        value={formatNumber(activeUsers)}
        accent
      />
      <MetricCard
        label="Total Requests"
        value={formatNumber(totalRequests)}
      />
      <MetricCard
        label="Data Served"
        value={formatBytes(totalDataServed)}
      />
      <MetricCard
        label="Data Cached"
        value={formatBytes(totalDataCached)}
      />
      <MetricCard
        label="% Cached"
        value={`${cachedPercentage.toFixed(1)}%`}
        accent={cachedPercentage > 50}
      />
    </div>
  );
}
