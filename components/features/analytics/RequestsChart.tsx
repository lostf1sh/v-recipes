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

export function RequestsChart({ data }: RequestsChartProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
        <h3 className="mb-4 text-lg font-bold text-[#ededed]">Requests Over Time</h3>
        <div className="flex h-72 items-center justify-center text-xs text-[#555555]">No data available</div>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
      <h3 className="mb-4 text-lg font-bold text-[#ededed]">
        Requests Over Time
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
              tickFormatter={formatNumber}
              stroke="#555555"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
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
              formatter={(value) => [
                Number(value).toLocaleString(),
                "Requests",
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#888888" }} />
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
