"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { TopIPEntry, TimeRange } from "@/lib/types";
import { useIPDetails } from "@/lib/hooks/useAnalytics";
import { formatNumber } from "@/lib/format";

interface IPDetailsPanelProps {
  ip: string;
  range: TimeRange;
}

function IPDetailsPanel({ ip, range }: IPDetailsPanelProps) {
  const { details, loading } = useIPDetails(ip, range);

  if (loading) {
    return (
      <div className="mt-3 border-t border-border pt-3">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-text-muted border-t-transparent" />
          Loading details...
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="mt-3 border-t border-border pt-3">
        <p className="text-xs text-text-muted">Could not load details</p>
      </div>
    );
  }

  const colos = details.colos ?? [];
  const showColos = colos.length > 8 ? colos.slice(0, 7) : colos;
  const extraColosCount = colos.length > 8 ? colos.length - 7 : 0;

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
        <div>
          <span className="text-text-muted">Country</span>
          <p className="font-medium text-text-primary">{details.country || "Unknown"}</p>
        </div>
        <div>
          <span className="text-text-muted">ASN</span>
          <p className="truncate font-medium text-text-primary">
            {details.asn ? `AS${details.asn}` : "Unknown"}
            {details.asnDesc ? ` - ${details.asnDesc}` : ""}
          </p>
        </div>
        <div>
          <span className="text-text-muted">Sampled</span>
          <p className="font-medium text-text-primary">{formatNumber(details.sampledCount)}</p>
        </div>
        <div>
          <span className="text-text-muted">IP</span>
          <p className="truncate font-mono font-medium text-text-primary">{details.ip || ip}</p>
        </div>
      </div>

      {/* Datacenter locations */}
      {colos.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-text-muted">Datacenter Locations</p>
          <div className="flex flex-wrap gap-1.5">
            {showColos.map((colo) => (
              <span
                key={colo}
                className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-medium tabular-nums text-text-secondary"
              >
                {colo}
              </span>
            ))}
            {extraColosCount > 0 && (
              <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-medium text-text-muted">
                +{extraColosCount}
              </span>
            )}
          </div>
        </div>
      )}

      {details.paths && details.paths.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-text-muted">Top Paths</p>
          <div className="space-y-1">
            {details.paths.slice(0, 8).map((p) => (
              <div key={p.path} className="flex items-center justify-between text-xs">
                <span className="min-w-0 truncate font-mono text-text-secondary">{p.path}</span>
                <span className="ml-2 shrink-0 tabular-nums text-text-muted">
                  {formatNumber(p.count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TopIPsListProps {
  data: TopIPEntry[];
  range: TimeRange;
}

export function TopIPsList({ data, range }: TopIPsListProps) {
  const [expandedIP, setExpandedIP] = useState<string | null>(null);
  if (!Array.isArray(data)) return null;
  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 20);
  const totalCount = sorted.reduce((s, e) => s + e.count, 0);

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="mb-4 text-lg font-bold text-text-primary">
        Top Users
      </h3>
      <div className="space-y-2">
        {sorted.map((entry) => {
          const isExpanded = expandedIP === entry.originalIP;
          const pct = totalCount > 0 ? (entry.count / totalCount) * 100 : 0;
          return (
            <div
              key={entry.ip}
              className={cn(
                "rounded-lg border border-transparent px-3 py-2.5 transition-colors",
                isExpanded
                  ? "border-border bg-surface-elevated"
                  : "hover:bg-surface-elevated/70"
              )}
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedIP(isExpanded ? null : entry.originalIP)
                }
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={cn(
                      "shrink-0 text-text-muted transition-transform duration-200",
                      isExpanded && "rotate-90"
                    )}
                  >
                    <path
                      d="M4.5 2.5L8 6L4.5 9.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="truncate font-mono text-sm text-text-primary">
                    {entry.ip}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs tabular-nums text-text-muted">
                  <span>{formatNumber(entry.count)} req</span>
                  <span className="text-accent">{pct.toFixed(1)}%</span>
                </div>
              </button>

              {isExpanded && (
                <IPDetailsPanel ip={entry.originalIP} range={range} />
              )}
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-xs text-text-muted">No data available</p>
        )}
      </div>
    </div>
  );
}
