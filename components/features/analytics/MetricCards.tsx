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
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tabular-nums tracking-tight",
          accent ? "text-accent" : "text-text-primary"
        )}
      >
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
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
