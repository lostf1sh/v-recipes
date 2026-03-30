import type { Metadata } from "next";
import { BCFSClient } from "./BCFSClient";

export const metadata: Metadata = {
  title: "Better Cloudflare Status",
  description: "Cloudflare global network status - simplified, real-time monitoring.",
};

export default function BCFSPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <header className="mb-8 text-center animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Better Cloudflare Status
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Cloudflare Status, Simplified
        </p>
      </header>
      <BCFSClient />
    </div>
  );
}
