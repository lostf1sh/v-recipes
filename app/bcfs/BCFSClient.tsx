"use client";

import dynamic from "next/dynamic";

const CloudflareStatus = dynamic(
  () =>
    import("@/components/features/bcfs/CloudflareStatus").then(
      (mod) => mod.CloudflareStatus
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-5">
        <div className="rounded-lg border border-border bg-surface px-5 py-4 animate-fade-up">
          <p className="text-sm text-text-muted">Loading status...</p>
        </div>
      </div>
    ),
  }
);

export function BCFSClient() {
  return <CloudflareStatus />;
}
