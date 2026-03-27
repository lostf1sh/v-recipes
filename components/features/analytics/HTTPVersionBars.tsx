"use client";

import type { HTTPVersionEntry } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const versionConfig: Record<string, { color: string; label: string }> = {
  "HTTP/1.0": { color: "#ef4444", label: "HTTP/1.0" },
  "HTTP/1.1": { color: "#f59e0b", label: "HTTP/1.1" },
  "HTTP/2":   { color: "#3f83f8", label: "HTTP/2" },
  "HTTP/3":   { color: "#10b981", label: "HTTP/3" },
};

interface HTTPVersionBarsProps {
  data: HTTPVersionEntry[];
}

export function HTTPVersionBars({ data }: HTTPVersionBarsProps) {
  if (!Array.isArray(data)) return null;
  const sorted = [...data].sort((a, b) => b.requests - a.requests);
  const totalRequests = sorted.reduce((s, e) => s + e.requests, 0);

  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
      <h3 className="mb-4 text-lg font-bold text-[#ededed]">
        Client HTTP Version Used
      </h3>

      {/* Stacked bar */}
      {totalRequests > 0 && (
        <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-[#111111]">
          {sorted.map((entry) => {
            const cfg = versionConfig[entry.version] ?? { color: "#555555" };
            return (
              <div
                key={entry.version}
                className="h-full transition-all duration-500"
                style={{
                  width: `${entry.percentage}%`,
                  backgroundColor: cfg.color,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Legend rows */}
      <div className="space-y-3">
        {sorted.map((entry) => {
          const cfg = versionConfig[entry.version] ?? { color: "#555555", label: entry.version };
          return (
            <div key={entry.version} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: cfg.color }}
                />
                <span className="text-sm font-medium text-[#ededed]">
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs tabular-nums">
                <span className="text-[#888888]">{formatNumber(entry.requests)}</span>
                <span
                  className="min-w-[3.5rem] text-right font-semibold"
                  style={{ color: cfg.color }}
                >
                  {entry.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-xs text-[#555555]">No data available</p>
        )}
      </div>
    </div>
  );
}
