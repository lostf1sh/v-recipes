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
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-5 py-4 animate-fade-up">
          <p className="text-sm text-[#555]">Loading status...</p>
        </div>
      </div>
    ),
  }
);

export function BCFSClient() {
  return <CloudflareStatus />;
}
