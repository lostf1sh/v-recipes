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

const tooltipStyle = {
  backgroundColor: "var(--color-surface-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--color-text-primary)",
};

export function DataServedChart({ data }: DataServedChartProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="mb-4 text-lg font-bold text-text-primary">Data Served Over Time</h3>
        <div className="flex h-72 items-center justify-center text-xs text-text-muted">No data available</div>
      </div>
    );
  }
  const chartData = data.map((d) => ({
    timestamp: d.timestamp,
    totalMB: toMB(d.data_served),
    cachedMB: toMB(d.data_cached),
  }));

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="mb-4 text-lg font-bold text-text-primary">
        Data Served Over Time
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={0} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatAxisTime}
              stroke="var(--color-text-muted)"
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
              stroke="var(--color-text-muted)"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(label) => formatTooltipTime(String(label))}
              formatter={(value, name) => [
                `${Number(value).toFixed(3)}`,
                name === "totalMB" ? "Total Data (MB)" : "Cached Data (MB)",
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "var(--color-text-secondary)" }}
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
