"use client";

import { cn } from "@/lib/cn";
import type { TimeRange } from "@/lib/types";

const ranges: { value: TimeRange; label: string }[] = [
  { value: "6h", label: "6h" },
  { value: "12h", label: "12h" },
  { value: "15h", label: "15h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
];

interface TimeRangeTabsProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
  disabled?: boolean;
}

export function TimeRangeTabs({ selected, onChange, disabled }: TimeRangeTabsProps) {
  return (
    <div className={cn("inline-flex rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-1", disabled && "opacity-50 pointer-events-none")}>
      {ranges.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          disabled={disabled}
          className={cn(
            "rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer",
            selected === value
              ? "bg-[#3f83f8] text-white"
              : "text-[#555555] hover:text-[#888888]"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
