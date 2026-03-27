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
      <div className="mt-3 border-t border-[#1a1a1a] pt-3">
        <div className="flex items-center gap-2 text-xs text-[#555555]">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#555555] border-t-transparent" />
          Loading details...
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="mt-3 border-t border-[#1a1a1a] pt-3">
        <p className="text-xs text-[#555555]">Could not load details</p>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-[#1a1a1a] pt-3">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
        <div>
          <span className="text-[#555555]">Country</span>
          <p className="font-medium text-[#ededed]">{details.country || "Unknown"}</p>
        </div>
        <div>
          <span className="text-[#555555]">ASN</span>
          <p className="truncate font-medium text-[#ededed]">{details.asnDesc || details.asn || "Unknown"}</p>
        </div>
        <div>
          <span className="text-[#555555]">Sampled</span>
          <p className="font-medium text-[#ededed]">{formatNumber(details.sampledCount)}</p>
        </div>
        <div>
          <span className="text-[#555555]">Colos</span>
          <p className="truncate font-medium text-[#ededed]">{details.colos?.slice(0, 5).join(", ") || "—"}</p>
        </div>
      </div>

      {details.paths && details.paths.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-[#555555]">Top Paths</p>
          <div className="space-y-1">
            {details.paths.slice(0, 5).map((p) => (
              <div key={p.path} className="flex items-center justify-between text-xs">
                <span className="min-w-0 truncate font-mono text-[#888888]">{p.path}</span>
                <span className="ml-2 shrink-0 tabular-nums text-[#555555]">
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
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
      <h3 className="mb-4 text-lg font-bold text-[#ededed]">
        Top Users
      </h3>
      <div className="space-y-2">
        {sorted.map((entry) => {
          const isExpanded = expandedIP === entry.ip;
          const pct = totalCount > 0 ? (entry.count / totalCount) * 100 : 0;
          return (
            <div
              key={entry.ip}
              className={cn(
                "rounded-lg border border-transparent px-3 py-2.5 transition-colors",
                isExpanded
                  ? "border-[#1a1a1a] bg-[#111111]"
                  : "hover:bg-[#111111]/50"
              )}
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedIP(isExpanded ? null : entry.originalIP)
                }
                className="flex w-full cursor-pointer items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={cn(
                      "shrink-0 text-[#555555] transition-transform duration-200",
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
                  <span className="truncate font-mono text-sm text-[#ededed]">
                    {entry.ip}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs tabular-nums text-[#555555]">
                  <span>{formatNumber(entry.count)} req</span>
                  <span className="text-[#3f83f8]">{pct.toFixed(1)}%</span>
                </div>
              </button>

              {isExpanded && (
                <IPDetailsPanel ip={entry.originalIP} range={range} />
              )}
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
