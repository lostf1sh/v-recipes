"use client";

import { useState, useEffect, useRef } from "react";
import type { TimeRange, DataPerIPResponse, DataPerIPPathStat } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const API_BASE = "/api/analytics";

interface EstimatedUsageProps {
  range: TimeRange;
}

export function EstimatedUsage({ range }: EstimatedUsageProps) {
  const [data, setData] = useState<DataPerIPResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(false);

    fetch(`${API_BASE}/dataperip?range=${range}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((json: DataPerIPResponse) => {
        if (!controller.signal.aborted) {
          setData(json);
          setError(false);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [range]);

  if (loading) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
        <div className="flex items-center gap-2 text-sm text-[#555555]">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#555555] border-t-transparent" />
          Loading your usage data...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
        <p className="text-sm text-[#555555]">
          Could not load your estimated usage data.
        </p>
      </div>
    );
  }

  const pathEntries = Object.entries(data.pathStats ?? {}).sort(
    ([, a], [, b]) => b.count - a.count
  );

  // Collect unique protocols across all paths
  const allProtocols = new Set<string>();
  for (const [, stat] of pathEntries) {
    for (const p of stat.protocols) {
      allProtocols.add(p);
    }
  }

  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
      <h3 className="mb-4 text-lg font-bold text-[#ededed]">
        Your Estimated Usage
      </h3>

      {/* Summary grid */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryItem label="Your IP" value={data.clientIP || "Unknown"} mono />
        <SummaryItem
          label="Your ISP (ASN)"
          value={
            data.clientASN
              ? `AS${data.clientASN}${data.clientASNDescription ? ` - ${data.clientASNDescription}` : ""}`
              : "Unknown"
          }
        />
        <SummaryItem
          label="Total Requests"
          value={formatNumber(data.totalRequests)}
        />
        <SummaryItem
          label="Unique Paths"
          value={String(data.uniquePathsCount)}
        />
        <SummaryItem
          label="Protocols Used"
          value={allProtocols.size > 0 ? Array.from(allProtocols).join(", ") : "None"}
        />
      </div>

      {/* Path breakdown */}
      {pathEntries.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-[#555555]">
            Your Last Usage
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1a1a1a] text-[#555555]">
                  <th className="pb-2 pr-4 font-medium">Path</th>
                  <th className="pb-2 pr-4 text-right font-medium">Requests</th>
                  <th className="pb-2 pr-4 text-right font-medium">Cache Hit</th>
                  <th className="pb-2 pr-4 font-medium">Methods</th>
                  <th className="pb-2 font-medium">Protocols</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]/50">
                {pathEntries.slice(0, 10).map(([path, stat]) => (
                  <PathRow key={path} path={path} stat={stat} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Privacy notice */}
      <p className="mt-4 text-[10px] leading-relaxed text-[#555555]">
        This data is based on your last 1,000 DNS requests and is an estimate of
        your usage. Your IP address is used to identify your requests and is not
        stored beyond the analytics window.
      </p>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-[#555555]">{label}</p>
      <p
        className={`mt-0.5 truncate text-sm font-medium text-[#ededed] ${mono ? "font-mono" : ""}`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function PathRow({
  path,
  stat,
}: {
  path: string;
  stat: DataPerIPPathStat;
}) {
  return (
    <tr className="text-[#888888]">
      <td className="truncate py-1.5 pr-4 font-mono text-[#ededed]" style={{ maxWidth: "280px" }}>
        {path}
      </td>
      <td className="py-1.5 pr-4 text-right tabular-nums text-[#3f83f8]">
        {formatNumber(stat.count)}
      </td>
      <td className="py-1.5 pr-4 text-right tabular-nums">
        {stat.cacheHitRate}%
      </td>
      <td className="py-1.5 pr-4">
        {stat.methods.join(", ")}
      </td>
      <td className="py-1.5">
        {stat.protocols.join(", ")}
      </td>
    </tr>
  );
}
