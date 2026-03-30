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
    <div className={cn("inline-flex rounded-lg border border-border bg-surface p-1", disabled && "pointer-events-none opacity-50")}>
      {ranges.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          disabled={disabled}
          aria-pressed={selected === value}
          className={cn(
            "rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            selected === value
              ? "bg-accent text-white"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
