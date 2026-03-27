"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DataPoint } from "@/lib/types";
import { formatBytes } from "@/lib/format";

function formatAxisTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatTooltipTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function toMB(bytes: number): number {
  return parseFloat((bytes / (1024 * 1024)).toFixed(3));
}

function formatMB(value: number): string {
  if (value >= 1024) return `${(value / 1024).toFixed(1)} GB`;
  return `${Math.round(value)} MB`;
}

interface DataServedChartProps {
  data: DataPoint[];
}

export function DataServedChart({ data }: DataServedChartProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
        <h3 className="mb-4 text-lg font-bold text-[#ededed]">Data Served Over Time</h3>
        <div className="flex h-72 items-center justify-center text-xs text-[#555555]">No data available</div>
      </div>
    );
  }
  const chartData = data.map((d) => ({
    timestamp: d.timestamp,
    totalMB: toMB(d.data_served),
    cachedMB: toMB(d.data_cached),
  }));

  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
      <h3 className="mb-4 text-lg font-bold text-[#ededed]">
        Data Served Over Time
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={0} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatAxisTime}
              stroke="#555555"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatMB}
              stroke="#555555"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111111",
                border: "1px solid #1a1a1a",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#ededed",
              }}
              labelFormatter={(label) => formatTooltipTime(String(label))}
              formatter={(value, name) => [
                `${Number(value).toFixed(3)}`,
                name === "totalMB" ? "Total Data (MB)" : "Cached Data (MB)",
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#888888" }}
              formatter={(value) =>
                value === "totalMB" ? "Total Data (MB)" : "Cached Data (MB)"
              }
            />
            <Bar dataKey="totalMB" fill="#3d9970" radius={[1, 1, 0, 0]} />
            <Bar dataKey="cachedMB" fill="#3f83f8" radius={[1, 1, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
