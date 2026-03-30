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
} from "recharts";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { fetchEdgeLocationLabel } from "@/lib/cfColo";
import { fetchIpinfoFromBrowser, isNonPublicIp } from "@/lib/geo";

async function loadSpeedTestLib() {
  const mod = await import("@cloudflare/speedtest");
  return mod.default;
}

type Phase = "idle" | "baseline" | "download" | "upload" | "complete";

/** Single phase: seconds from phase start → latency (ms) */
interface LatencyPhasePoint {
  time: number;
  ms: number;
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

function parseCfTrace(text: string): Record<string, string> {
  return Object.fromEntries(
    text
      .split("\n")
      .filter(Boolean)
      .map((l) => {
        const [k, ...v] = l.split("=");
        return [k, v.join("=")];
      })
  );
}

/** Coerce speedtest latency APIs (number[] of pings) to numbers */
function latencyNums(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => (typeof x === "number" ? x : Number(x)))
    .filter((x) => !Number.isNaN(x));
}

function spreadSeries(values: number[], t0: number, t1: number): { time: number; v: number }[] {
  if (!values.length) return [];
  const span = Math.max(t1 - t0, 0.01);
  return values.map((v, i) => ({
    time: t0 + (i / Math.max(values.length - 1, 1)) * span,
    v,
  }));
}

/** Reduce single-sample spikes in loaded-latency traces (display only). */
function smoothLoadedLatencySeries(values: number[]): number[] {
  if (values.length === 0) return [];
  const w = 3;
  const half = Math.floor(w / 2);
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - half), Math.min(values.length, i + half + 1));
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

interface PhaseBoundaries {
  download?: number;
  upload?: number;
}

/** Independent series per phase (x = seconds from that phase start). */
function buildLatencyPhaseSeries(
  elapsed: number,
  idleArr: number[],
  dlArr: number[],
  ulArr: number[],
  boundaries: PhaseBoundaries
): {
  idle: LatencyPhasePoint[];
  downloadLoaded: LatencyPhasePoint[];
  uploadLoaded: LatencyPhasePoint[];
} {
  const downStart = boundaries.download ?? elapsed * 0.15;
  const upStart = boundaries.upload ?? elapsed * 0.55;

  const dlSmooth = smoothLoadedLatencySeries(dlArr);
  const ulSmooth = smoothLoadedLatencySeries(ulArr);

  const tIdleEnd = Math.max(downStart, 0.01);
  const tDlEnd = Math.max(upStart, downStart + 0.01);
  const tEnd = Math.max(elapsed, upStart + 0.01);

  const idleSpan = tIdleEnd;
  const dlSpan = Math.max(tDlEnd - downStart, 0.01);
  const ulSpan = Math.max(tEnd - upStart, 0.01);

  const idle = spreadSeries(idleArr, 0, idleSpan).map((p) => ({ time: p.time, ms: p.v }));
  const downloadLoaded = spreadSeries(dlSmooth, 0, dlSpan).map((p) => ({ time: p.time, ms: p.v }));
  const uploadLoaded = spreadSeries(ulSmooth, 0, ulSpan).map((p) => ({ time: p.time, ms: p.v }));

  return { idle, downloadLoaded, uploadLoaded };
}

/** Evenly spaced tick values for a linear time axis (readable, not jittery). */
function niceTimeTicks(maxSec: number, maxTicks = 8): number[] {
  if (maxSec <= 0) return [0];
  const target = Math.max(maxTicks - 1, 1);
  const raw = maxSec / target;
  const pow10 = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow10;
  const niceUnit = n <= 1 ? pow10 : n <= 2 ? 2 * pow10 : n <= 5 ? 5 * pow10 : 10 * pow10;
  const ticks: number[] = [];
  for (let t = 0; t <= maxSec + 1e-6; t += niceUnit) {
    ticks.push(Math.round(t * 100) / 100);
  }
  const last = ticks[ticks.length - 1];
  if (last < maxSec - 0.05) ticks.push(Math.round(maxSec * 100) / 100);
  return ticks;
}

const tooltipStyle = {
  backgroundColor: "#111111",
  border: "1px solid #1a1a1a",
  borderRadius: "8px",
  fontSize: "11px",
  color: "#ededed",
};

const xTickFormat = (v: number) => `${Number(v).toFixed(1)}`;

function LatencyPhaseCard({
  title,
  hint,
  data,
  stroke,
  emptyLabel,
}: {
  title: string;
  hint: string;
  data: LatencyPhasePoint[];
  stroke: string;
  emptyLabel: string;
}) {
  const maxT = data.length > 0 ? Math.max(...data.map((d) => d.time)) : 1;
  const maxMs = data.length > 0 ? Math.max(...data.map((d) => d.ms)) : 0;
  const yDomain: [number, number] = [0, Math.max(80, Math.ceil(maxMs / 40) * 40 + 20)];
  const ticks = niceTimeTicks(maxT, 6);

  return (
    <div className="flex flex-col rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-4">
      <h3 className="text-sm font-semibold text-[#ededed]">{title}</h3>
      <p className="mt-0.5 text-[10px] leading-snug text-[#666666]">{hint}</p>
      {data.length === 0 ? (
        <p className="mt-4 flex min-h-[180px] flex-1 items-center justify-center text-center text-xs text-[#555555]">
          {emptyLabel}
        </p>
      ) : (
        <div className="mt-3 h-52 w-full min-h-0 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis
                dataKey="time"
                type="number"
                domain={[0, maxT]}
                ticks={ticks}
                stroke="#555555"
                tick={{ fontSize: 10 }}
                tickFormatter={xTickFormat}
                axisLine={false}
                tickLine={false}
                label={{ value: "Time in phase (s)", position: "insideBottom", offset: -5, fill: "#555555", fontSize: 10 }}
              />
              <YAxis
                domain={yDomain}
                stroke="#555555"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={42}
                label={{ value: "ms", angle: -90, position: "insideLeft", fill: "#555555", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(v) => `${Number(v).toFixed(2)}s`}
                formatter={(v) =>
                  v != null && typeof v === "number" ? [`${v.toFixed(1)} ms`, "Latency"] : ["—", "Latency"]
                }
              />
              <Line
                type="linear"
                dataKey="ms"
                stroke={stroke}
                strokeWidth={1.75}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const THROUGHPUT_SMOOTH_WINDOW = 4;

function movingAverageNullable(values: (number | null)[], window: number): (number | null)[] {
  if (values.length === 0) return [];
  const half = Math.floor(window / 2);
  return values.map((_, i) => {
    const slice: number[] = [];
    for (let j = Math.max(0, i - half); j <= Math.min(values.length - 1, i + half); j++) {
      const v = values[j];
      if (v != null && !Number.isNaN(v)) slice.push(v);
    }
    return slice.length ? slice.reduce((a, b) => a + b, 0) / slice.length : values[i];
  });
}

function buildThroughputPoints(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dlPoints: any[] | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ulPoints: any[] | undefined
): ThroughputPoint[] {
  type Sample = { t: number; download: number | null; upload: number | null };
  const samples: Sample[] = [];

  const pushDl = (p: Record<string, unknown>) => {
    const bps = p.bps ?? p.value ?? p.bandwidth ?? p.bitsPerSecond;
    const mbpsRaw = typeof bps === "number" ? bps / 1e6 : 0;
    const mbps = Math.round(mbpsRaw * 100) / 100;
    const measTime = p.measTime;
    if (typeof measTime === "number" && Number.isFinite(measTime)) {
      samples.push({ t: measTime, download: mbps, upload: null });
    }
  };

  const pushUl = (p: Record<string, unknown>) => {
    const bps = p.bps ?? p.value ?? p.bandwidth ?? p.bitsPerSecond;
    const mbpsRaw = typeof bps === "number" ? bps / 1e6 : 0;
    const mbps = Math.round(mbpsRaw * 100) / 100;
    const measTime = p.measTime;
    if (typeof measTime === "number" && Number.isFinite(measTime)) {
      samples.push({ t: measTime, download: null, upload: mbps });
    }
  };

  if (dlPoints && Array.isArray(dlPoints)) {
    dlPoints.forEach((p) => pushDl(p as Record<string, unknown>));
  }
  if (ulPoints && Array.isArray(ulPoints)) {
    ulPoints.forEach((p) => pushUl(p as Record<string, unknown>));
  }

  if (!samples.length) return [];

  const tMin = Math.min(...samples.map((s) => s.t));
  const bySec = new Map<number, ThroughputPoint>();

  for (const s of samples) {
    const time = Math.round(((s.t - tMin) / 1000) * 1000) / 1000;
    const prev = bySec.get(time) ?? { time, download: null, upload: null };
    if (s.download != null) prev.download = s.download;
    if (s.upload != null) prev.upload = s.upload;
    bySec.set(time, prev);
  }

  let merged = [...bySec.values()].sort((a, b) => a.time - b.time);

  const dlCol = merged.map((r) => r.download);
  const ulCol = merged.map((r) => r.upload);
  const dlSm = movingAverageNullable(dlCol, THROUGHPUT_SMOOTH_WINDOW);
  const ulSm = movingAverageNullable(ulCol, THROUGHPUT_SMOOTH_WINDOW);

  merged = merged.map((row, i) => ({
    time: row.time,
    download: dlSm[i] ?? row.download,
    upload: ulSm[i] ?? row.upload,
  }));

  return merged;
}

/** Deployed site used to read cdn-cgi/trace when localhost has no CF edge. */
const PRODUCTION_ORIGIN = "https://v.recipes";

async function fetchConnectionInfo(): Promise<ConnectionInfo> {
  try {
    let clientTrace: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const tryTraceUrls = [`${window.location.origin}/cdn-cgi/trace`, `${PRODUCTION_ORIGIN}/cdn-cgi/trace`];
      for (const url of tryTraceUrls) {
        try {
          const r = await fetch(url, { cache: "no-store", mode: "cors" });
          if (!r.ok) continue;
          const parsed = parseCfTrace(await r.text());
          if (parsed.colo?.trim()) {
            clientTrace = parsed;
            break;
          }
          if (Object.keys(clientTrace).length === 0) clientTrace = parsed;
        } catch {
          /* try next */
        }
      }
    }

    const res = await fetch("/api/trace", { cache: "no-store" });
    const data = await res.json();

    let ip = (clientTrace.ip && clientTrace.ip.trim()) || data.ip || "Unknown";
    let isp = typeof data.isp === "string" ? data.isp : "Unknown";
    const warp = (clientTrace.warp && clientTrace.warp.trim()) || data.warp || "off";

    // PoP: browser trace (same host or v.recipes fallback), else CF-Ray parsed by /api/trace (visitor's edge).
    const fromTrace = clientTrace.colo?.trim();
    const fromApi =
      typeof data.colo === "string" && data.colo !== "Unknown" ? data.colo.trim() : "";
    const edgeColo = fromTrace || fromApi;
    const location = await fetchEdgeLocationLabel(edgeColo || undefined);

    const missingIpIsp =
      isNonPublicIp(ip) || ip === "Unknown" || isp === "Unknown";

    if (missingIpIsp) {
      const g = await fetchIpinfoFromBrowser();
      if (g) {
        if (isNonPublicIp(ip) || ip === "Unknown") {
          const pub = typeof g.ip === "string" ? g.ip.trim() : "";
          if (pub) ip = pub;
        }
        if (isp === "Unknown" && typeof g.org === "string" && g.org) isp = g.org;
      }
    }

    return {
      ip,
      isp: isp || "Unknown",
      location,
      connectionType:
        warp === "on"
          ? "Cloudflare WARP"
          : `Connected via IPv${ip.includes(":") ? "6" : "4"}`,
    };
  } catch {
    return { ip: "Unknown", isp: "Unknown", location: "Unknown", connectionType: "Unknown" };
  }
}

export function BufferbloatTest() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connInfo, setConnInfo] = useState<ConnectionInfo | null>(null);

  const [latencySeries, setLatencySeries] = useState<{
    idle: LatencyPhasePoint[];
    downloadLoaded: LatencyPhasePoint[];
    uploadLoaded: LatencyPhasePoint[];
  }>({ idle: [], downloadLoaded: [], uploadLoaded: [] });
  const [throughputPoints, setThroughputPoints] = useState<ThroughputPoint[]>([]);
  const [chartRunKey, setChartRunKey] = useState(0);

  const testStartTime = useRef(0);
  const currentPhaseRef = useRef<Phase>("baseline");
  const runIdRef = useRef(0);
  const phaseBoundariesRef = useRef<PhaseBoundaries>({});

  useEffect(() => {
    fetchConnectionInfo().then(setConnInfo);
  }, []);

  const startTest = useCallback(async () => {
    const runId = ++runIdRef.current;
    setChartRunKey((k) => k + 1);

    setPhase("baseline");
    currentPhaseRef.current = "baseline";
    setProgress(0);
    setResults(null);
    setError(null);
    setLatencySeries({ idle: [], downloadLoaded: [], uploadLoaded: [] });
    setThroughputPoints([]);
    phaseBoundariesRef.current = {};
    testStartTime.current = Date.now();

    fetchConnectionInfo().then(setConnInfo);

    try {
      const SpeedTest = await loadSpeedTestLib();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const engine = new (SpeedTest as any)({
        autoStart: false,
        logAimApiUrl: "",
        measureDownloadLoadedLatency: true,
        measureUploadLoadedLatency: true,
        measurements: [
          { type: "latency", numPackets: 20 },
          { type: "download", bytes: 1e7, count: 8 },
          { type: "upload", bytes: 1e6, count: 5 },
          { type: "latency", numPackets: 20 },
        ],
      });

      const totalMeasurements = 4;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      engine.onPhaseChange = ({ measurementId, measurement }: any) => {
        if (runId !== runIdRef.current) return;
        const elapsed = (Date.now() - testStartTime.current) / 1000;
        const { type } = measurement as { type: string };

        if (type === "download") {
          phaseBoundariesRef.current.download = elapsed;
          currentPhaseRef.current = "download";
          setPhase("download");
        } else if (type === "upload") {
          phaseBoundariesRef.current.upload = elapsed;
          currentPhaseRef.current = "upload";
          setPhase("upload");
        } else if (type === "latency") {
          if (measurementId === 0) {
            currentPhaseRef.current = "baseline";
            setPhase("baseline");
          } else {
            currentPhaseRef.current = "upload";
            setPhase("upload");
          }
        }

        setProgress(Math.min(95, Math.round(((measurementId + 1) / totalMeasurements) * 100)));
      };

      engine.onResultsChange = () => {
        if (runId !== runIdRef.current) return;

        const elapsed = (Date.now() - testStartTime.current) / 1000;

        try {
          const r = engine.results;
          const idleArr = latencyNums(r.getUnloadedLatencyPoints?.());
          const dlArr = latencyNums(r.getDownLoadedLatencyPoints?.());
          const ulArr = latencyNums(r.getUpLoadedLatencyPoints?.());

          setLatencySeries(
            buildLatencyPhaseSeries(elapsed, idleArr, dlArr, ulArr, phaseBoundariesRef.current)
          );
        } catch {
          /* not available yet */
        }

        try {
          const dlPts = engine.results.getDownloadBandwidthPoints?.();
          const ulPts = engine.results.getUploadBandwidthPoints?.();
          const next = buildThroughputPoints(dlPts, ulPts);
          if (next.length) setThroughputPoints(next);
        } catch {
          /* not available yet */
        }
      };

      engine.onFinish = () => {
        if (runId !== runIdRef.current) return;
        const r = engine.results;
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
        if (runId !== runIdRef.current) return;
        setError(msg || "Speed test encountered an error.");
        setPhase("idle");
      };

      engine.play();
    } catch (err) {
      if (runId !== runIdRef.current) return;
      setError("Failed to load speed test engine. Please try again.");
      setPhase("idle");
      console.error(err);
    }
  }, []);

  const isRunning = phase !== "idle" && phase !== "complete";

  const throughputMaxTime =
    throughputPoints.length > 0 ? Math.max(...throughputPoints.map((p) => p.time), 0) : 0;
  const chartMaxTime = Math.max(throughputMaxTime, 1);
  const xTicks = niceTimeTicks(chartMaxTime);

  return (
    <div className="space-y-6">
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

        {isRunning && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#111111]">
            <div className="h-full rounded-full bg-[#3f83f8] transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        )}

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

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-center text-sm text-red-400">{error}</div>
      )}

      {(isRunning || phase === "complete") && connInfo && (
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <h2 className="mb-1 text-lg font-semibold text-[#ededed]">Server Location</h2>
          <p className="mb-4 text-xs text-[#555555]">
            Cloudflare edge (PoP) for this connection — not your city. Shown from <code className="text-[#888]">cdn-cgi/trace</code>,{" "}
            <code className="text-[#888]">CF-Ray</code> on the API, or a trace to {PRODUCTION_ORIGIN} during local dev.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoCard label="Your IP" value={connInfo.ip} />
            <InfoCard label="ISP" value={connInfo.isp} />
            <InfoCard label="Server Location" value={connInfo.location} />
            <InfoCard label="Connection Type" value={connInfo.connectionType} />
          </div>
        </div>
      )}

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

      {(isRunning || phase === "complete") && (
        <div className="space-y-3" key={`lat-${chartRunKey}`}>
          <h2 className="text-lg font-semibold text-[#ededed]">Latency Analysis</h2>
          <p className="text-xs text-[#888888]">
            Three separate charts — each uses its own timeline (0s = start of that phase). Loaded latency is
            lightly smoothed. Updates apply only within the matching card.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <LatencyPhaseCard
              title="Idle latency"
              hint="Unloaded ping samples during the baseline latency measurement."
              data={latencySeries.idle}
              stroke="#6366f1"
              emptyLabel="Waiting for baseline samples…"
            />
            <LatencyPhaseCard
              title="Download (loaded)"
              hint="Latency while the download workload is saturating the link."
              data={latencySeries.downloadLoaded}
              stroke="#3b82f6"
              emptyLabel="Waiting for download-phase samples…"
            />
            <LatencyPhaseCard
              title="Upload (loaded)"
              hint="Latency while the upload workload is saturating the link."
              data={latencySeries.uploadLoaded}
              stroke="#22d3ee"
              emptyLabel="Waiting for upload-phase samples…"
            />
          </div>
        </div>
      )}

      {(isRunning || phase === "complete") && throughputPoints.length > 0 && (
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-6" key={`tp-${chartRunKey}`}>
          <h2 className="mb-1 text-lg font-semibold text-[#ededed]">Throughput Over Time</h2>
          <p className="mb-4 text-xs text-[#888888]">
            Download and upload speeds measured throughout the test (lightly smoothed).
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis
                  dataKey="time"
                  type="number"
                  domain={[0, chartMaxTime]}
                  ticks={xTicks}
                  stroke="#555555"
                  tick={{ fontSize: 10 }}
                  tickFormatter={xTickFormat}
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
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(v) => `${Number(v).toFixed(2)}s`}
                  formatter={(v, name) =>
                    v != null && typeof v === "number"
                      ? [`${Number(v).toFixed(2)} Mbps`, name]
                      : ["—", name]
                  }
                />
                <Legend wrapperStyle={{ fontSize: 11, color: "#888888" }} />
                <Line
                  type="linear"
                  dataKey="download"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Download"
                  connectNulls
                  isAnimationActive={false}
                />
                <Line
                  type="linear"
                  dataKey="upload"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name="Upload"
                  connectNulls
                  isAnimationActive={false}
                />
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
