"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadSpeedTestLib(): Promise<any> {
  const mod = await (Function(
    'return import("https://cdn.skypack.dev/@cloudflare/speedtest")'
  )());
  return mod.default;
}

type Phase = "idle" | "baseline" | "download" | "upload" | "complete";

interface LatencyPoint {
  time: number;
  latency: number;
  phase: string;
}

interface ThroughputPoint {
  time: number;
  download: number | null;
  upload: number | null;
}

interface ConnectionInfo {
  ip: string;
  isp: string;
  location: string;
  connectionType: string;
}

interface TestResults {
  downloadSpeed: number | null;
  uploadSpeed: number | null;
  idleLatency: number | null;
  loadedLatency: number | null;
  jitter: number | null;
  grade: string;
  gradeMessage: string;
}

const phaseSteps: { key: Phase; label: string }[] = [
  { key: "baseline", label: "Baseline" },
  { key: "download", label: "Download" },
  { key: "upload", label: "Upload" },
  { key: "complete", label: "Complete" },
];

function getGrade(loaded: number): { grade: string; message: string } {
  if (loaded < 15) return { grade: "A+", message: "Excellent! Minimal bufferbloat." };
  if (loaded < 50) return { grade: "A", message: "Very good. Low bufferbloat." };
  if (loaded < 100) return { grade: "B", message: "Good. Moderate bufferbloat." };
  if (loaded < 300) return { grade: "C", message: "Acceptable, but noticeable lag under load." };
  if (loaded < 500) return { grade: "D", message: "Poor. Significant bufferbloat detected." };
  return { grade: "F", message: "Very poor. Severe bufferbloat." };
}

function gradeColor(grade: string): string {
  const map: Record<string, string> = {
    "A+": "text-emerald-400", A: "text-green-400", B: "text-lime-400",
    C: "text-yellow-400", D: "text-orange-400", F: "text-red-400",
  };
  return map[grade] ?? "text-red-400";
}

async function fetchConnectionInfo(): Promise<ConnectionInfo> {
  try {
    const res = await fetch("/api/trace");
    const data = await res.json();
    const location = [data.city, data.colo ? `(${data.colo})` : ""]
      .filter(Boolean)
      .join(" ") || "Unknown";
    return {
      ip: data.ip ?? "Unknown",
      isp: data.isp ?? "Unknown",
      location,
      connectionType: data.warp === "on"
        ? "WARP"
        : `Connected via IPv${data.ip?.includes(":") ? "6" : "4"}`,
    };
  } catch {
    return { ip: "Unknown", isp: "Unknown", location: "Unknown", connectionType: "Unknown" };
  }
}

// --- Chart tooltip styles ---
const tooltipStyle = {
  backgroundColor: "#111111",
  border: "1px solid #1a1a1a",
  borderRadius: "8px",
  fontSize: "11px",
  color: "#ededed",
};

export function BufferbloatTest() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connInfo, setConnInfo] = useState<ConnectionInfo | null>(null);

  // Real-time data
  const [latencyPoints, setLatencyPoints] = useState<LatencyPoint[]>([]);
  const [throughputPoints, setThroughputPoints] = useState<ThroughputPoint[]>([]);
  const [phaseMarkers, setPhaseMarkers] = useState<{ phase: string; startTime: number }[]>([]);
  const testStartTime = useRef(0);
  const currentPhaseRef = useRef<Phase>("baseline");

  // Fetch connection info on mount
  useEffect(() => {
    fetchConnectionInfo().then(setConnInfo);
  }, []);

  const startTest = useCallback(async () => {
    setPhase("baseline");
    currentPhaseRef.current = "baseline";
    setProgress(0);
    setResults(null);
    setError(null);
    setLatencyPoints([]);
    setThroughputPoints([]);
    setPhaseMarkers([]);
    testStartTime.current = Date.now();

    // Re-fetch connection info
    fetchConnectionInfo().then(setConnInfo);

    try {
      const SpeedTest = await loadSpeedTestLib();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const engine = new (SpeedTest as any)({
        autoStart: false,
        logAimApiUrl: "", // disable telemetry to avoid CORS errors
        measurements: [
          { type: "latency", numPackets: 20 },
          { type: "download", bytes: 1e7, count: 8 },
          { type: "upload", bytes: 1e6, count: 5 },
          { type: "latency", numPackets: 20 },
        ],
      });

      let measurementIdx = 0;
      const totalMeasurements = 4;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      engine.onResultsChange = (ev: any) => {
        const elapsed = (Date.now() - testStartTime.current) / 1000;
        const type = ev?.type;

        // Update phase
        let newPhase: Phase = currentPhaseRef.current;
        if (type === "latency" && !engine.results.getDownloadBandwidth()) {
          newPhase = "baseline";
        } else if (type === "download") {
          newPhase = "download";
        } else if (type === "upload") {
          newPhase = "upload";
        } else if (type === "latency" && engine.results.getDownloadBandwidth()) {
          newPhase = "upload"; // post-test latency, still in upload phase visually
        }

        if (newPhase !== currentPhaseRef.current) {
          currentPhaseRef.current = newPhase;
          setPhase(newPhase);
          setPhaseMarkers((prev) => [...prev, { phase: newPhase, startTime: elapsed }]);
          measurementIdx++;
        }

        setProgress(Math.min(95, Math.round(((measurementIdx + 0.5) / totalMeasurements) * 100)));

        // Collect latency data points
        try {
          const latencyPts = engine.results.getUnloadedLatencyPoints();
          if (latencyPts && Array.isArray(latencyPts)) {
            const mapped: LatencyPoint[] = latencyPts.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (p: any, i: number) => ({
                time: p.time != null ? p.time : i,
                latency: p.value ?? p.latency ?? p,
                phase: "baseline",
              })
            );
            if (mapped.length) setLatencyPoints((prev) => {
              // Merge without duplicates based on time
              const existing = new Set(prev.map((p) => p.time));
              const newOnes = mapped.filter((p) => !existing.has(p.time));
              return [...prev, ...newOnes];
            });
          }
        } catch { /* not available yet */ }

        // Collect throughput data
        try {
          const dlPoints = engine.results.getDownloadBandwidthPoints();
          const ulPoints = engine.results.getUploadBandwidthPoints();
          const newThroughput: ThroughputPoint[] = [];

          if (dlPoints && Array.isArray(dlPoints)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dlPoints.forEach((p: any, i: number) => {
              // Points have .bps field (bits per second), convert to Mbps
              const bps = p.bps ?? p.value ?? p.bandwidth ?? p.bitsPerSecond ?? (typeof p === "number" ? p : 0);
              const mbps = typeof bps === "number" ? bps / 1e6 : 0;
              newThroughput.push({
                time: p.time ?? p.duration ?? i * 2,
                download: Math.round(mbps * 100) / 100,
                upload: null,
              });
            });
          }
          if (ulPoints && Array.isArray(ulPoints)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ulPoints.forEach((p: any, i: number) => {
              const bps = p.bps ?? p.value ?? p.bandwidth ?? p.bitsPerSecond ?? (typeof p === "number" ? p : 0);
              const mbps = typeof bps === "number" ? bps / 1e6 : 0;
              const roundedMbps = Math.round(mbps * 100) / 100;
              const time = p.time ?? p.duration ?? i * 2;
              const existingIdx = newThroughput.findIndex(
                (t) => Math.abs(t.time - time) < 0.5
              );
              if (existingIdx >= 0) {
                newThroughput[existingIdx].upload = roundedMbps;
              } else {
                newThroughput.push({
                  time,
                  download: null,
                  upload: roundedMbps,
                });
              }
            });
          }
          if (newThroughput.length) {
            setThroughputPoints(newThroughput.sort((a, b) => a.time - b.time));
          }
        } catch { /* not available yet */ }
      };

      engine.onFinish = () => {
        const r = engine.results;
        // getDownloadBandwidth() returns bps (bits per second)
        const downloadBps = r.getDownloadBandwidth();
        const uploadBps = r.getUploadBandwidth();
        const idle = r.getUnloadedLatency();
        const dlLoaded = r.getDownLoadedLatency();
        const ulLoaded = r.getUpLoadedLatency();
        const jitter = r.getUnloadedJitter();
        const loaded = Math.max(dlLoaded ?? 0, ulLoaded ?? 0);
        const { grade, message } = getGrade(loaded);

        setResults({
          downloadSpeed: downloadBps != null ? Math.round((downloadBps / 1e6) * 100) / 100 : null,
          uploadSpeed: uploadBps != null ? Math.round((uploadBps / 1e6) * 100) / 100 : null,
          idleLatency: idle != null ? Math.round(idle * 100) / 100 : null,
          loadedLatency: loaded > 0 ? Math.round(loaded * 100) / 100 : null,
          jitter: jitter != null ? Math.round(jitter * 100) / 100 : null,
          grade,
          gradeMessage: message,
        });
        setPhase("complete");
        setProgress(100);
      };

      engine.onError = (msg: string) => {
        setError(msg || "Speed test encountered an error.");
        setPhase("idle");
      };

      engine.play();
    } catch (err) {
      setError("Failed to load speed test engine. Please try again.");
      setPhase("idle");
      console.error(err);
    }
  }, []);

  const isRunning = phase !== "idle" && phase !== "complete";

  return (
    <div className="space-y-6">
      {/* Phase Stepper */}
      <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
        <div className="flex items-center justify-center gap-1 sm:gap-3">
          {phaseSteps.map(({ key, label }, i) => {
            const currentIdx = phaseSteps.findIndex((p) => p.key === phase);
            const done = currentIdx > i || phase === "complete";
            const active = phase === key;
            return (
              <div key={key} className="flex items-center gap-1 sm:gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all",
                      active ? "bg-[#3f83f8] text-white scale-110" :
                      done ? "bg-emerald-500 text-white" :
                      "bg-[#111111] text-[#555555]"
                    )}
                  >
                    {done ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={cn("text-[10px] sm:text-xs", active ? "font-semibold text-[#ededed]" : "text-[#555555]")}>
                    {label}
                  </span>
                </div>
                {i < phaseSteps.length - 1 && (
                  <div className={cn("h-0.5 w-6 sm:w-12 rounded-full transition-colors mb-4", done ? "bg-emerald-500" : "bg-[#1a1a1a]")} />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        {isRunning && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#111111]">
            <div className="h-full rounded-full bg-[#3f83f8] transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Start / Retest button */}
        <div className="mt-6 flex justify-center">
          {phase === "idle" && (
            <Button onClick={startTest} size="lg" className="px-16 py-3 text-base">
              Start Test
            </Button>
          )}
          {phase === "complete" && (
            <Button onClick={startTest} size="lg" variant="outline" className="px-12">
              Run Test Again
            </Button>
          )}
          {isRunning && (
            <p className="animate-pulse text-sm text-[#888888]">
              Running {phase} test...
            </p>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-center text-sm text-red-400">{error}</div>
      )}

      {/* Connection Info */}
      {(isRunning || phase === "complete") && connInfo && (
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#ededed]">Server Location</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoCard label="Your IP" value={connInfo.ip} />
            <InfoCard label="ISP" value={connInfo.isp} />
            <InfoCard label="Server Location" value={connInfo.location} />
            <InfoCard label="Connection Type" value={connInfo.connectionType} />
          </div>
        </div>
      )}

      {/* Summary */}
      {results && phase === "complete" && (
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#ededed]">Summary</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <MetricCard label="Download Speed" value={results.downloadSpeed} unit="Mbps" color="text-[#3f83f8]" />
            <MetricCard label="Upload Speed" value={results.uploadSpeed} unit="Mbps" color="text-blue-400" />
            <MetricCard label="Idle Latency" value={results.idleLatency} unit="ms" />
            <MetricCard label="Loaded Latency" value={results.loadedLatency} unit="ms" />
            <MetricCard label="Jitter" value={results.jitter} unit="ms" />
            <div className="rounded-lg bg-[#111111] p-4 text-center">
              <div className="text-xs text-[#555555]">Bufferbloat Grade</div>
              <div className={cn("mt-1 text-3xl font-black", gradeColor(results.grade))}>
                {results.grade}
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-[#888888]">{results.gradeMessage}</p>
        </div>
      )}

      {/* Latency Analysis Chart */}
      {(isRunning || phase === "complete") && latencyPoints.length > 0 && (
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <h2 className="mb-1 text-lg font-semibold text-[#ededed]">Latency Analysis</h2>
          <p className="mb-4 text-xs text-[#888888]">
            Response time throughout the test. Lower values indicate a more responsive connection.
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#555555"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: "Time (s)", position: "insideBottom", offset: -5, fill: "#555555", fontSize: 10 }}
                />
                <YAxis
                  stroke="#555555"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                  label={{ value: "Latency (ms)", angle: -90, position: "insideLeft", fill: "#555555", fontSize: 10 }}
                />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => `${Number(v).toFixed(1)}s`} formatter={(v) => [`${Number(v).toFixed(1)} ms`, "Latency"]} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#888888" }} />
                {phaseMarkers.map((m, i) => (
                  <ReferenceLine key={`${m.phase}-${i}`} x={m.startTime} stroke="#555555" strokeDasharray="4 4" label={{ value: m.phase, fill: "#888888", fontSize: 10, position: "top" }} />
                ))}
                <Line type="monotone" dataKey="latency" stroke="#6366f1" strokeWidth={1.5} dot={false} name="Latency" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Throughput Over Time Chart */}
      {(isRunning || phase === "complete") && throughputPoints.length > 0 && (
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <h2 className="mb-1 text-lg font-semibold text-[#ededed]">Throughput Over Time</h2>
          <p className="mb-4 text-xs text-[#888888]">
            Download and upload speeds measured throughout the test.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#555555"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: "Time (s)", position: "insideBottom", offset: -5, fill: "#555555", fontSize: 10 }}
                />
                <YAxis
                  stroke="#555555"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                  label={{ value: "Speed (Mbps)", angle: -90, position: "insideLeft", fill: "#555555", fontSize: 10 }}
                />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => `${Number(v).toFixed(1)}s`} formatter={(v, name) => [`${Number(v).toFixed(2)} Mbps`, name]} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#888888" }} />
                <Line type="monotone" dataKey="download" stroke="#10b981" strokeWidth={2} dot={false} name="Download" connectNulls isAnimationActive={false} />
                <Line type="monotone" dataKey="upload" stroke="#f59e0b" strokeWidth={2} dot={false} name="Upload" connectNulls isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, unit, color }: { label: string; value: number | null; unit: string; color?: string }) {
  return (
    <div className="rounded-lg bg-[#111111] p-4 text-center">
      <div className="text-[10px] uppercase tracking-wider text-[#555555]">{label}</div>
      <div className={cn("mt-1 text-2xl font-bold tabular-nums", color ?? "text-[#ededed]")}>
        {value != null ? value : "—"}
      </div>
      <div className="text-xs text-[#555555]">{unit}</div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#111111] p-3">
      <div className="text-[10px] uppercase tracking-wider text-[#555555]">{label}</div>
      <div className="mt-1 text-sm font-semibold text-[#ededed]">{value}</div>
    </div>
  );
}
