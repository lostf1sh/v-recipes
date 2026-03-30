"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DataPoint } from "@/lib/types";
import { formatNumber } from "@/lib/format";

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

interface RequestsChartProps {
  data: DataPoint[];
}

const tooltipStyle = {
  backgroundColor: "var(--color-surface-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--color-text-primary)",
};

export function RequestsChart({ data }: RequestsChartProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="mb-4 text-lg font-bold text-text-primary">Requests Over Time</h3>
        <div className="flex h-72 items-center justify-center text-xs text-text-muted">No data available</div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="mb-4 text-lg font-bold text-text-primary">
        Requests Over Time
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
              tickFormatter={formatNumber}
              stroke="var(--color-text-muted)"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(label) => formatTooltipTime(String(label))}
              formatter={(value) => [
                Number(value).toLocaleString(),
                "Requests",
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-text-secondary)" }} />
            <Line
              type="monotone"
              dataKey="requests"
              stroke="#3f83f8"
              strokeWidth={2}
              dot={{ r: 2.5, fill: "#3f83f8", strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#6ba3fa" }}
              name="Requests"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
