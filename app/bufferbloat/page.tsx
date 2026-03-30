import type { Metadata } from "next";
import { BufferbloatTest } from "@/components/features/bufferbloat/BufferbloatTest";

export const metadata: Metadata = {
  title: "Bufferbloat Test",
  description:
    "Measure your network's bufferbloat and get a detailed analysis of your connection's real-time performance under load.",
};

export default function BufferbloatPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <header className="mb-12 text-center animate-fade-up" style={{ animationDelay: "0ms" }}>
        <h1 className="text-4xl font-bold tracking-tight text-text-primary">Bufferbloat Test</h1>
        <p className="mx-auto mt-3 max-w-lg text-text-secondary">
          Network Performance Analysis with Real-Time Measurements
        </p>
        <p className="mx-auto mt-2 max-w-xl text-xs text-text-muted">
          A sophisticated test that measures baseline latency, download, upload,
          and loaded latency measurements to detect bufferbloat in your network.
        </p>
      </header>

      <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
        <BufferbloatTest />
      </div>

      {/* Understanding Results */}
      <section
        className="mt-12 rounded-lg border border-border bg-surface p-6 animate-fade-up"
        style={{ animationDelay: "200ms" }}
      >
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Understanding Your Results</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Bufferbloat occurs when network equipment buffers too much data, causing
          high latency during periods of high throughput. This is measured by
          comparing your idle latency to latency under load.
        </p>

        <h3 className="mb-2 text-sm font-medium text-text-primary">Test Phases</h3>
        <ol className="mb-6 list-inside list-decimal space-y-1 text-sm text-text-secondary">
          <li><strong className="text-text-primary">Baseline</strong> &mdash; Measures idle latency</li>
          <li><strong className="text-text-primary">Download</strong> &mdash; Measures latency during download</li>
          <li><strong className="text-text-primary">Upload</strong> &mdash; Measures latency during upload</li>
        </ol>

        <h3 className="mb-3 text-sm font-medium text-text-primary">Grading Scale</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {[
            { grade: "A+", range: "<15ms", color: "text-emerald-400" },
            { grade: "A", range: "15-50ms", color: "text-green-400" },
            { grade: "B", range: "50-100ms", color: "text-lime-400" },
            { grade: "C", range: "100-300ms", color: "text-yellow-400" },
            { grade: "D", range: "300-500ms", color: "text-orange-400" },
            { grade: "F", range: ">500ms", color: "text-red-400" },
          ].map(({ grade, range, color }) => (
            <div
              key={grade}
              className="rounded-lg bg-surface-elevated px-3 py-2 text-center"
            >
              <div className={`text-lg font-bold ${color}`}>{grade}</div>
              <div className="text-xs text-text-muted">{range}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
