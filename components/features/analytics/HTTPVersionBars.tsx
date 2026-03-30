"use client";

import type { HTTPVersionEntry } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const versionConfig: Record<string, { color: string }> = {
  "HTTP/1.0": { color: "#f59e0b" },
  "HTTP/1.1": { color: "#ef4444" },
  "HTTP/2":   { color: "#10b981" },
  "HTTP/3":   { color: "#6366f1" },
};

function formatPct(pct: number): string {
  if (pct >= 10) return `${pct.toFixed(1)}%`;
  if (pct >= 1) return `${pct.toFixed(2)}%`;
  if (pct >= 0.1) return `${pct.toFixed(3)}%`;
  if (pct >= 0.01) return `${pct.toFixed(4)}%`;
  if (pct >= 0.001) return `${pct.toFixed(5)}%`;
  return `${pct.toFixed(6)}%`;
}

interface HTTPVersionBarsProps {
  data: HTTPVersionEntry[];
}

export function HTTPVersionBars({ data }: HTTPVersionBarsProps) {
  if (!Array.isArray(data)) return null;
  const sorted = [...data].sort((a, b) => b.requests - a.requests);
  const totalRequests = sorted.reduce((s, e) => s + e.requests, 0);
  const maxPct = sorted[0]?.percentage ?? 1;

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="mb-4 text-lg font-bold text-text-primary">
        Client HTTP Version Used
      </h3>

      {/* Total requests hero */}
      {totalRequests > 0 && (
        <div className="mb-5 rounded-lg border border-border bg-surface-elevated py-4 text-center">
          <p className="text-3xl font-bold tabular-nums text-accent">
            {formatNumber(totalRequests)}
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-text-muted">
            Total Requests
          </p>
        </div>
      )}

      {/* Per-version breakdown */}
      <div className="rounded-lg border border-border bg-surface-elevated p-5">
        <div className="space-y-5">
          {sorted.map((entry) => {
            const cfg = versionConfig[entry.version] ?? { color: "var(--color-text-muted)" };
            return (
              <div key={entry.version}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="text-sm font-semibold text-text-primary">{entry.version}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: cfg.color }}>
                    {formatPct(entry.percentage)}
                  </span>
                </div>
                <p className="mb-1.5 ml-[18px] text-[11px] tabular-nums text-text-muted">
                  {formatNumber(entry.requests)} requests
                </p>
                <div className="ml-[18px] h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(entry.percentage / maxPct) * 100}%`,
                      backgroundColor: cfg.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sorted.length === 0 && (
        <p className="mt-4 text-xs text-text-muted">No data available</p>
      )}
    </div>
  );
}
