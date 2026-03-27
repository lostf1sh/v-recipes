"use client";

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#111111] ${className ?? ""}`}
    />
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metric cards skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-5"
          >
            <Pulse className="mb-3 h-3 w-20" />
            <Pulse className="h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6"
          >
            <Pulse className="mb-4 h-4 w-40" />
            <Pulse className="h-64 w-full" />
          </div>
        ))}
      </div>

      {/* Bottom sections skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6"
          >
            <Pulse className="mb-4 h-4 w-36" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j}>
                  <Pulse className="mb-1.5 h-3 w-full" />
                  <Pulse className="h-1.5 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
