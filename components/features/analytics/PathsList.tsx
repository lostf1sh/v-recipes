"use client";

import type { PathEntry } from "@/lib/types";
import { formatNumber } from "@/lib/format";

interface PathsListProps {
  data: PathEntry[];
}

export function PathsList({ data }: PathsListProps) {
  if (!Array.isArray(data)) return null;
  const sorted = [...data].sort((a, b) => b.requests - a.requests).slice(0, 15);
  const maxRequests = sorted[0]?.requests ?? 1;
  const totalRequests = sorted.reduce((s, e) => s + e.requests, 0);

  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
      <h3 className="mb-4 text-lg font-bold text-[#ededed]">
        Frequently Accessed Paths
      </h3>
      <div className="space-y-2.5">
        {sorted.map((entry) => (
          <div key={entry.path}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="min-w-0 truncate font-mono text-xs text-[#888888]">
                {entry.path}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-[#555555]">
                {formatNumber(entry.requests)} ({totalRequests > 0 ? ((entry.requests / totalRequests) * 100).toFixed(1) : "0.0"}%)
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#111111]">
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
          <p className="text-xs text-[#555555]">No data available</p>
        )}
      </div>
    </div>
  );
}
