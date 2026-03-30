"use client";

import type { PathEntry } from "@/lib/types";
import { formatNumber, formatBytes } from "@/lib/format";

interface PathsListProps {
  data: PathEntry[];
}

export function PathsList({ data }: PathsListProps) {
  if (!Array.isArray(data)) return null;
  const sorted = [...data].sort((a, b) => b.requests - a.requests).slice(0, 15);
  const maxRequests = sorted[0]?.requests ?? 1;
  const totalRequests = sorted.reduce((s, e) => s + e.requests, 0);

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="mb-4 text-lg font-bold text-text-primary">
        Frequently Accessed Paths
      </h3>
      <div className="space-y-2.5">
        {sorted.map((entry) => (
          <div key={entry.path}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="min-w-0 truncate font-mono text-xs text-text-secondary">
                {entry.path}
              </span>
              <div className="flex shrink-0 flex-col items-end">
                <span className="text-xs tabular-nums">
                  <span className="text-accent">{formatNumber(entry.requests)}</span>
                  <span className="text-text-muted"> ({totalRequests > 0 ? ((entry.requests / totalRequests) * 100).toFixed(1) : "0.0"}%)</span>
                </span>
                <span className="text-[10px] tabular-nums text-text-muted">
                  {formatBytes(entry.bytes)}
                </span>
              </div>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${(entry.requests / maxRequests) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-xs text-text-muted">No data available</p>
        )}
      </div>
    </div>
  );
}
