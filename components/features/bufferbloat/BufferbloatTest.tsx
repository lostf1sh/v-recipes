"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

async function loadSpeedTestLib() {
  const mod = await import("@cloudflare/speedtest");
  return mod.default;
}

type Phase = "idle" | "baseline" | "download" | "upload" | "complete";

interface LatencyPoint {
  time: number;
  latency: number;
  phase: "baseline" | "download" | "upload";
}

interface LatencyChartPoint {
  time: number;
  baseline: number | null;
  download: number | null;
  upload: number | null;
}

interface ThroughputPoint {
  time: number;
  download: number | null;
  upload: number | null;
}

interface BandwidthMeasurementPoint {
  bps: number;
  duration: number;
  ping: number;
  measTime: Date | number | string;
}

interface ConnectionInfo {
  ip: string;
  isp: string;
  userLocation: string;
  serverLocation: string;
  connectionType: string;
  colo: string | null;
  latitude: number | null;
  longitude: number | null;
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

const SERVER_MARKER_SVG = `<svg role="img" viewBox="0 0 460 271.2" width="40" height="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path fill="#FBAD41" d="M328.6,125.6c-0.8,0-1.5,0.6-1.8,1.4l-4.8,16.7c-2.1,7.2-1.3,13.8,2.2,18.7c3.2,4.5,8.6,7.1,15.1,7.4l26.2,1.6c0.8,0,1.5,0.4,1.9,1c0.4,0.6,0.5,1.5,0.3,2.2c-0.4,1.2-1.6,2.1-2.9,2.2l-27.3,1.6c-14.8,0.7-30.7,12.6-36.3,27.2l-2,5.1c-0.4,1,0.3,2,1.4,2h93.8c1.1,0,2.1-0.7,2.4-1.8c1.6-5.8,2.5-11.9,2.5-18.2c0-37-30.2-67.2-67.3-67.2C330.9,125.5,329.7,125.5,328.6,125.6z"></path>
  <path fill="#F6821F" d="M292.8,204.4c2.1-7.2,1.3-13.8-2.2-18.7c-3.2-4.5-8.6-7.1-15.1-7.4l-123.1-1.6c-0.8,0-1.5-0.4-1.9-1s-0.5-1.4-0.3-2.2c0.4-1.2,1.6-2.1,2.9-2.2l124.2-1.6c14.7-0.7,30.7-12.6,36.3-27.2l7.1-18.5c0.3-0.8,0.4-1.6,0.2-2.4c-8-36.2-40.3-63.2-78.9-63.2c-35.6,0-65.8,23-76.6,54.9c-7-5.2-15.9-8-25.5-7.1c-17.1,1.7-30.8,15.4-32.5,32.5c-0.4,4.4-0.1,8.7,0.9,12.7c-27.9,0.8-50.2,23.6-50.2,51.7c0,2.5,0.2,5,0.5,7.5c0.2,1.2,1.2,2.1,2.4,2.1h227.2c1.3,0,2.5-0.9,2.9-2.2L292.8,204.4z"></path>
</svg>`;

const USER_MARKER_SVG = `<svg role="img" viewBox="0 0 384 512" width="24" height="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>`;

const COLO_COORDINATES: Record<string, { lat: number; lon: number; city: string }> = {
  SJC: { lat: 37.3688, lon: -121.9143, city: "San Jose, USA" },
  LAX: { lat: 33.9416, lon: -118.4085, city: "Los Angeles, USA" },
  DFW: { lat: 32.8998, lon: -97.0403, city: "Dallas, USA" },
  ORD: { lat: 41.9742, lon: -87.9073, city: "Chicago, USA" },
  ATL: { lat: 33.6407, lon: -84.4277, city: "Atlanta, USA" },
  MIA: { lat: 25.7959, lon: -80.287, city: "Miami, USA" },
  IAD: { lat: 38.9531, lon: -77.4565, city: "Ashburn, USA" },
  EWR: { lat: 40.6895, lon: -74.1745, city: "Newark, USA" },
  SEA: { lat: 47.4502, lon: -122.3088, city: "Seattle, USA" },
  DEN: { lat: 39.8561, lon: -104.6737, city: "Denver, USA" },
  PHX: { lat: 33.4352, lon: -112.0101, city: "Phoenix, USA" },
  IAH: { lat: 29.9902, lon: -95.3368, city: "Houston, USA" },
  LHR: { lat: 51.47, lon: -0.4543, city: "London, UK" },
  AMS: { lat: 52.3105, lon: 4.7683, city: "Amsterdam, Netherlands" },
  FRA: { lat: 50.0379, lon: 8.5622, city: "Frankfurt, Germany" },
  CDG: { lat: 49.0097, lon: 2.5479, city: "Paris, France" },
  SIN: { lat: 1.3644, lon: 103.9915, city: "Singapore" },
  HKG: { lat: 22.308, lon: 113.9185, city: "Hong Kong" },
  NRT: { lat: 35.772, lon: 140.3929, city: "Tokyo, Japan" },
  SYD: { lat: -33.9399, lon: 151.1753, city: "Sydney, Australia" },
  MEL: { lat: -37.669, lon: 144.841, city: "Melbourne, Australia" },
  GRU: { lat: -23.4356, lon: -46.4731, city: "Sao Paulo, Brazil" },
  GIG: { lat: -22.8099, lon: -43.2436, city: "Rio de Janeiro, Brazil" },
  JNB: { lat: -26.1392, lon: 28.246, city: "Johannesburg, South Africa" },
  BOM: { lat: 19.0896, lon: 72.8656, city: "Mumbai, India" },
  DEL: { lat: 28.5562, lon: 77.1, city: "New Delhi, India" },
  ICN: { lat: 37.4602, lon: 126.4407, city: "Seoul, South Korea" },
};

function getColoMeta(colo: string | null | undefined) {
  if (!colo) return null;
  return COLO_COORDINATES[colo.toUpperCase()] ?? null;
}

function formatUserLocation(data: {
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
}) {
  const label = [data.city, data.region, data.country].filter(Boolean).join(", ");
  return label || data.loc || "Unknown";
}

function roundTo(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function normalizeElapsedSeconds(
  value: unknown,
  startWallTimeMs: number,
  elapsedSeconds: number,
  fallbackIndex: number,
  fallbackStep = 0.1
) {
  if (value instanceof Date) {
    const parsed = value.getTime();
    if (!Number.isNaN(parsed)) {
      return Math.max(0, roundTo((parsed - startWallTimeMs) / 1000, 3));
    }
  }

  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    if (!Number.isNaN(parsed)) {
      return Math.max(0, roundTo((parsed - startWallTimeMs) / 1000, 3));
    }
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    let seconds = value;

    // Handle wall-clock timestamps expressed as epoch milliseconds.
    if (seconds > 1e12) {
      return Math.max(0, roundTo((seconds - startWallTimeMs) / 1000, 3));
    }

    // The Cloudflare speedtest library often reports point times in milliseconds.
    // Bufferbloat tests are short-lived, so anything well above test duration is
    // normalized back to seconds before we plot it.
    if (seconds > Math.max(120, elapsedSeconds * 5 + 5)) {
      seconds /= 1000;
    }

    return Math.max(0, roundTo(seconds, 3));
  }

  return roundTo(fallbackIndex * fallbackStep, 3);
}

function mergeThroughputPoints(points: ThroughputPoint[]) {
  const merged = new Map<number, ThroughputPoint>();

  points
    .slice()
    .sort((a, b) => a.time - b.time)
    .forEach((point) => {
      const key = roundTo(point.time, 3);
      const existing = merged.get(key);

      if (existing) {
        merged.set(key, {
          time: key,
          download: point.download ?? existing.download,
          upload: point.upload ?? existing.upload,
        });
        return;
      }

      merged.set(key, { ...point, time: key });
    });

  return Array.from(merged.values()).sort((a, b) => a.time - b.time);
}

function mergeLatencyPoints(points: LatencyPoint[]) {
  const merged = new Map<number, LatencyPoint>();

  points
    .slice()
    .sort((a, b) => a.time - b.time)
    .forEach((point) => {
      const key = roundTo(point.time, 3);
      const existing = merged.get(key);

      if (!existing || point.phase !== "baseline") {
        merged.set(key, { ...point, time: key });
      }
    });

  return Array.from(merged.values()).sort((a, b) => a.time - b.time);
}

function percentile(values: number[], q: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = position - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function aggregateMedian(values: number[]) {
  return percentile(values, 0.5);
}

function getBucketSize(durationSeconds: number, dense = false) {
  if (durationSeconds >= 45) return dense ? 0.6 : 0.8;
  if (durationSeconds >= 25) return dense ? 0.35 : 0.5;
  if (durationSeconds >= 12) return dense ? 0.25 : 0.35;
  return dense ? 0.18 : 0.25;
}

function buildLatencyChartData(
  points: LatencyPoint[],
  durationSeconds: number
): LatencyChartPoint[] {
  if (!points.length) return [];

  const bucketSize = getBucketSize(durationSeconds, true);
  const buckets = new Map<
    number,
    {
      times: number[];
      baseline: number[];
      download: number[];
      upload: number[];
    }
  >();

  points
    .slice()
    .sort((a, b) => a.time - b.time)
    .forEach((point) => {
      const bucketKey = Math.floor(point.time / bucketSize);
      const bucket =
        buckets.get(bucketKey) ??
        {
          times: [],
          baseline: [],
          download: [],
          upload: [],
        };

      bucket.times.push(point.time);
      bucket[point.phase].push(point.latency);
      buckets.set(bucketKey, bucket);
    });

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, bucket]) => ({
      time: roundTo(bucket.times[bucket.times.length - 1] ?? 0, 3),
      baseline: bucket.baseline.length
        ? roundTo(aggregateMedian(bucket.baseline), 1)
        : null,
      download: bucket.download.length
        ? roundTo(aggregateMedian(bucket.download), 1)
        : null,
      upload: bucket.upload.length
        ? roundTo(aggregateMedian(bucket.upload), 1)
        : null,
    }));
}

function buildThroughputChartData(
  points: ThroughputPoint[],
  durationSeconds: number
) {
  if (!points.length) return [];

  const bucketSize = getBucketSize(durationSeconds);
  const buckets = new Map<
    number,
    {
      times: number[];
      download: number[];
      upload: number[];
    }
  >();

  points
    .slice()
    .sort((a, b) => a.time - b.time)
    .forEach((point) => {
      const bucketKey = Math.floor(point.time / bucketSize);
      const bucket =
        buckets.get(bucketKey) ?? { times: [], download: [], upload: [] };

      bucket.times.push(point.time);
      if (Number.isFinite(point.download)) {
        bucket.download.push(point.download as number);
      }
      if (Number.isFinite(point.upload)) {
        bucket.upload.push(point.upload as number);
      }
      buckets.set(bucketKey, bucket);
    });

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, bucket]) => ({
      time: roundTo(bucket.times[bucket.times.length - 1] ?? 0, 3),
      download: bucket.download.length
        ? roundTo(aggregateMedian(bucket.download), 2)
        : null,
      upload: bucket.upload.length
        ? roundTo(aggregateMedian(bucket.upload), 2)
        : null,
    }));
}

function buildBandwidthSeries(
  points: BandwidthMeasurementPoint[],
  startWallTimeMs: number,
  elapsedSeconds: number,
  phase: "download" | "upload"
) {
  const throughput: ThroughputPoint[] = [];
  const anchorTimes: number[] = [];

  points.forEach((point, index) => {
    const time = normalizeElapsedSeconds(
      point.measTime,
      startWallTimeMs,
      elapsedSeconds,
      index
    );

    anchorTimes.push(time);

    throughput.push({
      time,
      download: phase === "download" ? roundTo(point.bps / 1e6, 2) : null,
      upload: phase === "upload" ? roundTo(point.bps / 1e6, 2) : null,
    });
  });

  return { throughput, anchorTimes };
}

function buildBaselineLatencyPoints(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any,
  startWallTimeMs: number,
  elapsedSeconds: number
): LatencyPoint[] {
  try {
    const rawLatency = results.raw?.latency?.results ?? {};
    const firstKey = Object.keys(rawLatency)[0];
    const rawTimings = firstKey ? rawLatency[firstKey]?.timings ?? [] : [];

    if (Array.isArray(rawTimings) && rawTimings.length > 0) {
      return rawTimings
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((t: any, i: number) => ({
          time: normalizeElapsedSeconds(
            t?.measTime,
            startWallTimeMs,
            elapsedSeconds,
            i
          ),
          latency: t?.ping,
          phase: "baseline" as const,
        }))
        .filter((point) => Number.isFinite(point.latency));
    }
  } catch {
    // fall through to the public API fallback below
  }

  const latencyPts = results.getUnloadedLatencyPoints?.() ?? [];
  if (!Array.isArray(latencyPts)) return [];

  return latencyPts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any, i: number) => ({
      time: normalizeElapsedSeconds(
        p?.measTime ?? p?.time ?? p?.duration,
        startWallTimeMs,
        elapsedSeconds,
        i
      ),
      latency: p?.value ?? p?.latency ?? p,
      phase: "baseline" as const,
    }))
    .filter((point) => Number.isFinite(point.latency));
}

function buildLoadedLatencyPoints(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any,
  startWallTimeMs: number,
  elapsedSeconds: number,
  phase: "download" | "upload",
  anchorTimes: number[]
): LatencyPoint[] {
  const rawGroup =
    phase === "download"
      ? results.raw?.download ?? results.raw?.down ?? {}
      : results.raw?.upload ?? results.raw?.up ?? {};

  const rawPoints: LatencyPoint[] = [];

  Object.values(rawGroup).forEach((entry) => {
    const sideLatency =
      entry && typeof entry === "object" && "sideLatency" in entry
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (entry as any).sideLatency
        : [];

    if (!Array.isArray(sideLatency)) return;

    sideLatency.forEach((sample, index) => {
      const point = {
        time: normalizeElapsedSeconds(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (sample as any)?.measTime,
          startWallTimeMs,
          elapsedSeconds,
          index
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        latency: (sample as any)?.ping,
        phase,
      } satisfies LatencyPoint;

      if (Number.isFinite(point.latency)) {
        rawPoints.push(point);
      }
    });
  });

  if (rawPoints.length > 0) {
    return mergeLatencyPoints(rawPoints);
  }

  const fallback =
    phase === "download"
      ? results.getDownLoadedLatencyPoints?.() ?? []
      : results.getUpLoadedLatencyPoints?.() ?? [];

  if (!Array.isArray(fallback)) return [];

  return mergeLatencyPoints(
    fallback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((sample: any, index: number) => {
        const anchor = anchorTimes[Math.min(index, anchorTimes.length - 1)];
        const fallbackTime =
          anchor != null ? anchor + (index % 4) * 0.03 : index * 0.1;

        return {
          time: roundTo(fallbackTime, 3),
          latency: sample?.value ?? sample?.latency ?? sample,
          phase,
        } satisfies LatencyPoint;
      })
      .filter((point) => Number.isFinite(point.latency))
  );
}

function formatTimeTick(value: number) {
  if (!Number.isFinite(value)) return "";
  if (value < 10) return `${value.toFixed(1)}`;
  if (value < 100) return `${Math.round(value)}`;
  return `${Math.round(value)}`;
}

const LATENCY_PHASE_STYLES = {
  baseline: {
    label: "Baseline",
    area: "rgba(63, 131, 248, 0.07)",
    pill: "border-[#3f83f8]/30 bg-[#3f83f8]/10 text-[#7bb2ff]",
  },
  download: {
    label: "Download",
    area: "rgba(245, 158, 11, 0.08)",
    pill: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  upload: {
    label: "Upload",
    area: "rgba(99, 102, 241, 0.08)",
    pill: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  },
} as const;

function buildLatencyPhaseBands(
  phaseMarkers: { phase: string; startTime: number }[],
  chartEnd: number
) {
  const starts = {
    baseline: 0,
    download:
      phaseMarkers.find((marker) => marker.phase === "download")?.startTime ??
      null,
    upload:
      phaseMarkers.find((marker) => marker.phase === "upload")?.startTime ??
      null,
  };

  const segments: Array<{
    phase: keyof typeof LATENCY_PHASE_STYLES;
    start: number;
    end: number;
  }> = [];

  const baselineEnd = starts.download ?? chartEnd;
  if (baselineEnd > starts.baseline) {
    segments.push({ phase: "baseline", start: starts.baseline, end: baselineEnd });
  }

  if (starts.download != null) {
    const downloadEnd = starts.upload ?? chartEnd;
    if (downloadEnd > starts.download) {
      segments.push({ phase: "download", start: starts.download, end: downloadEnd });
    }
  }

  if (starts.upload != null && chartEnd > starts.upload) {
    segments.push({ phase: "upload", start: starts.upload, end: chartEnd });
  }

  return segments;
}

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
    const userLocation = formatUserLocation(data);
    const colo = typeof data.colo === "string" && data.colo !== "Unknown" ? data.colo : null;
    const coloMeta = getColoMeta(colo);
    const serverLocation = coloMeta
      ? `${coloMeta.city} (${colo})`
      : colo ?? "Unknown";
    const latitude = typeof data.latitude === "number" ? data.latitude : null;
    const longitude = typeof data.longitude === "number" ? data.longitude : null;

    return {
      ip: data.ip ?? "Unknown",
      isp: data.isp ?? "Unknown",
      userLocation,
      serverLocation,
      connectionType: data.warp === "on"
        ? "WARP"
        : `Connected via IPv${data.ip?.includes(":") ? "6" : "4"}`,
      colo,
      latitude,
      longitude,
    };
  } catch {
    return {
      ip: "Unknown",
      isp: "Unknown",
      userLocation: "Unknown",
      serverLocation: "Unknown",
      connectionType: "Unknown",
      colo: null,
      latitude: null,
      longitude: null,
    };
  }
}

// --- Chart tooltip styles ---
const tooltipStyle = {
  backgroundColor: "var(--color-surface-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "11px",
  color: "var(--color-text-primary)",
};

export function BufferbloatTest() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connInfo, setConnInfo] = useState<ConnectionInfo | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Real-time data
  const [latencyPoints, setLatencyPoints] = useState<LatencyPoint[]>([]);
  const [throughputPoints, setThroughputPoints] = useState<ThroughputPoint[]>([]);
  const [phaseMarkers, setPhaseMarkers] = useState<{ phase: string; startTime: number }[]>([]);
  const testStartTime = useRef(0);
  const testStartPerf = useRef(0);
  const currentPhaseRef = useRef<Phase>("baseline");
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const mapLayersRef = useRef<LayerGroup | null>(null);

  // Fetch connection info on mount
  useEffect(() => {
    fetchConnectionInfo().then(setConnInfo);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      if (!connInfo || !mapContainerRef.current) return;

      const serverMeta = getColoMeta(connInfo.colo);
      if (!serverMeta) return;

      const L = await import("leaflet");
      if (cancelled || !mapContainerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current, {
          scrollWheelZoom: false,
          worldCopyJump: true,
        }).setView([serverMeta.lat, serverMeta.lon], 4);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors &bull; CartoDB",
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;
      mapLayersRef.current?.remove();
      const layerGroup = L.layerGroup().addTo(map);
      mapLayersRef.current = layerGroup;

      const serverIcon = L.divIcon({
        className: "cf-marker-icon cf-server-marker",
        html: SERVER_MARKER_SVG,
        iconSize: [40, 24],
        iconAnchor: [20, 24],
      });
      const userIcon = L.divIcon({
        className: "cf-marker-icon cf-user-marker",
        html: USER_MARKER_SVG,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      });

      const serverCoords: [number, number] = [serverMeta.lat, serverMeta.lon];
      const serverMarker = L.marker(serverCoords, { icon: serverIcon })
        .addTo(layerGroup)
        .bindPopup(`<b>Cloudflare ${connInfo.colo}</b><br>${serverMeta.city}`);

      if (connInfo.latitude != null && connInfo.longitude != null) {
        const userCoords: [number, number] = [connInfo.latitude, connInfo.longitude];
        L.marker(userCoords, { icon: userIcon })
          .addTo(layerGroup)
          .bindPopup(`<b>Your Location</b><br>${connInfo.userLocation}`);

        L.polyline([userCoords, serverCoords], {
          color: "#FF7A18",
          weight: 3,
          opacity: 0.95,
        }).addTo(layerGroup);

        map.fitBounds([userCoords, serverCoords], { padding: [50, 50] });
      } else {
        map.setView(serverCoords, 4);
      }

      serverMarker.openPopup();
      window.setTimeout(() => map.invalidateSize(), 0);
    }

    void setupMap();

    return () => {
      cancelled = true;
    };
  }, [connInfo]);

  useEffect(() => {
    return () => {
      mapLayersRef.current?.remove();
      mapRef.current?.remove();
      mapLayersRef.current = null;
      mapRef.current = null;
    };
  }, []);

  const isRunning = phase !== "idle" && phase !== "complete";

  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      setElapsedTime(roundTo((performance.now() - testStartPerf.current) / 1000, 1));
    }, 100);

    return () => window.clearInterval(interval);
  }, [isRunning]);

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
    testStartPerf.current = performance.now();
    setElapsedTime(0);

    // Re-fetch connection info
    fetchConnectionInfo().then(setConnInfo);

    try {
      const SpeedTest = await loadSpeedTestLib();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const engine = new (SpeedTest as any)({
        autoStart: false,
        logAimApiUrl: "", // disable telemetry to avoid CORS errors
        measureDownloadLoadedLatency: true,
        measureUploadLoadedLatency: true,
        loadedLatencyThrottle: 100,
        loadedLatencyMaxPoints: 200,
        measurements: [
          { type: "latency", numPackets: 10 },
          { type: "download", bytes: 1e5, count: 9, bypassMinDuration: true },
          { type: "download", bytes: 1e6, count: 8 },
          { type: "download", bytes: 1e7, count: 6 },
          { type: "upload", bytes: 1e5, count: 8, bypassMinDuration: true },
          { type: "upload", bytes: 1e6, count: 6 },
          { type: "upload", bytes: 1e7, count: 4 },
        ],
      });

      let measurementIdx = 0;
      const totalMeasurements = 4;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      engine.onResultsChange = (ev: any) => {
        const elapsed = (performance.now() - testStartPerf.current) / 1000;
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

        // Collect throughput data
        try {
          const dlPoints = (engine.results.getDownloadBandwidthPoints?.() ??
            []) as BandwidthMeasurementPoint[];
          const ulPoints = (engine.results.getUploadBandwidthPoints?.() ??
            []) as BandwidthMeasurementPoint[];

          const downloadSeries = buildBandwidthSeries(
            dlPoints,
            testStartTime.current,
            elapsed,
            "download"
          );
          const uploadSeries = buildBandwidthSeries(
            ulPoints,
            testStartTime.current,
            elapsed,
            "upload"
          );

          const newThroughput = [
            ...downloadSeries.throughput,
            ...uploadSeries.throughput,
          ];

          if (newThroughput.length) {
            setThroughputPoints(mergeThroughputPoints(newThroughput));
          }

          const latencySeries = mergeLatencyPoints([
            ...buildBaselineLatencyPoints(
              engine.results,
              testStartTime.current,
              elapsed
            ),
            ...buildLoadedLatencyPoints(
              engine.results,
              testStartTime.current,
              elapsed,
              "download",
              downloadSeries.anchorTimes
            ),
            ...buildLoadedLatencyPoints(
              engine.results,
              testStartTime.current,
              elapsed,
              "upload",
              uploadSeries.anchorTimes
            ),
          ]);

          if (latencySeries.length > 0) {
            setLatencyPoints(latencySeries);
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
        setElapsedTime(roundTo((performance.now() - testStartPerf.current) / 1000, 1));
      };

      engine.onError = (msg: string) => {
        setError(msg || "Speed test encountered an error.");
        setPhase("idle");
        setElapsedTime(0);
      };

      engine.play();
    } catch (err) {
      setError("Failed to load speed test engine. Please try again.");
      setPhase("idle");
      console.error(err);
    }
  }, []);
  const displayLatencyPoints = buildLatencyChartData(
    latencyPoints,
    Math.max(
      elapsedTime,
      latencyPoints[latencyPoints.length - 1]?.time ?? 0
    )
  );
  const displayThroughputPoints = buildThroughputChartData(
    throughputPoints,
    Math.max(
      elapsedTime,
      throughputPoints[throughputPoints.length - 1]?.time ?? 0
    )
  );
  const latencyDomainMax = Math.max(
    5,
    elapsedTime,
    latencyPoints[latencyPoints.length - 1]?.time ?? 0
  );
  const throughputDomainMax = Math.max(
    5,
    elapsedTime,
    throughputPoints[throughputPoints.length - 1]?.time ?? 0
  );
  const latencyPhaseBands = buildLatencyPhaseBands(phaseMarkers, latencyDomainMax);
  const throughputPhaseBands = buildLatencyPhaseBands(phaseMarkers, throughputDomainMax);

  return (
    <div className="space-y-6">
      {/* Phase Stepper */}
      <div className="rounded-lg border border-border bg-surface p-6">
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
                      "bg-surface-elevated text-text-muted"
                    )}
                  >
                    {done ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={cn("text-[10px] sm:text-xs", active ? "font-semibold text-text-primary" : "text-text-muted")}>
                    {label}
                  </span>
                </div>
                {i < phaseSteps.length - 1 && (
                  <div className={cn("mb-4 h-0.5 w-6 rounded-full transition-colors sm:w-12", done ? "bg-emerald-500" : "bg-border")} />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        {isRunning && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-elevated">
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
            <p className="animate-pulse text-sm text-text-secondary">
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
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Server Location</h2>
          <div
            ref={mapContainerRef}
            className="bufferbloat-map mb-4 h-[300px] overflow-hidden rounded-xl"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoCard label="Your IP" value={connInfo.ip} />
            <InfoCard label="ISP" value={connInfo.isp} />
            <InfoCard label="Server Location" value={connInfo.serverLocation} />
            <InfoCard label="Connection Type" value={connInfo.connectionType} />
          </div>
        </div>
      )}

      {/* Summary */}
      {results && phase === "complete" && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Summary</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <MetricCard label="Download Speed" value={results.downloadSpeed} unit="Mbps" color="text-[#3f83f8]" />
            <MetricCard label="Upload Speed" value={results.uploadSpeed} unit="Mbps" color="text-blue-400" />
            <MetricCard label="Idle Latency" value={results.idleLatency} unit="ms" />
            <MetricCard label="Loaded Latency" value={results.loadedLatency} unit="ms" />
            <MetricCard label="Jitter" value={results.jitter} unit="ms" />
            <div className="rounded-lg bg-surface-elevated p-4 text-center">
              <div className="text-xs text-text-muted">Bufferbloat Grade</div>
              <div className={cn("mt-1 text-3xl font-black", gradeColor(results.grade))}>
                {results.grade}
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-text-secondary">{results.gradeMessage}</p>
        </div>
      )}

      {/* Latency Analysis Chart */}
      {(isRunning || phase === "complete") && displayLatencyPoints.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-1 text-lg font-semibold text-text-primary">Latency Analysis</h2>
          <p className="mb-4 text-xs text-text-secondary">
            Response time throughout the test. Lower values indicate a more responsive connection.
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {(
              Object.entries(LATENCY_PHASE_STYLES) as Array<
                [keyof typeof LATENCY_PHASE_STYLES, (typeof LATENCY_PHASE_STYLES)[keyof typeof LATENCY_PHASE_STYLES]]
              >
            ).map(([phase, style]) => (
              <span
                key={phase}
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
                  style.pill
                )}
              >
                {style.label}
              </span>
            ))}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayLatencyPoints} margin={{ top: 8, right: 8, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                {latencyPhaseBands.map((band) => (
                  <ReferenceArea
                    key={`${band.phase}-${band.start}`}
                    x1={band.start}
                    x2={band.end}
                    ifOverflow="extendDomain"
                    fill={LATENCY_PHASE_STYLES[band.phase].area}
                    strokeOpacity={0}
                  />
                ))}
                <XAxis
                  type="number"
                  dataKey="time"
                  domain={[0, latencyDomainMax]}
                  stroke="var(--color-text-muted)"
                  tick={{ fontSize: 10 }}
                  tickFormatter={formatTimeTick}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: "Time (s)", position: "insideBottom", offset: -6, fill: "var(--color-text-muted)", fontSize: 10 }}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                  label={{ value: "Latency (ms)", angle: -90, position: "insideLeft", fill: "var(--color-text-muted)", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(v) => `${Number(v).toFixed(1)}s`}
                  formatter={(v, name) => [
                    `${Number(v).toFixed(1)} ms`,
                    name === "baseline"
                      ? "Baseline"
                      : name === "download"
                        ? "Download"
                        : "Upload",
                  ]}
                />
                <Line
                  type="linear"
                  dataKey="baseline"
                  stroke="#3f83f8"
                  strokeWidth={1.8}
                  dot={false}
                  connectNulls={false}
                  name="baseline"
                  isAnimationActive={false}
                />
                <Line
                  type="linear"
                  dataKey="download"
                  stroke="#f59e0b"
                  strokeWidth={1.8}
                  dot={false}
                  connectNulls={false}
                  name="download"
                  isAnimationActive={false}
                />
                <Line
                  type="linear"
                  dataKey="upload"
                  stroke="#818cf8"
                  strokeWidth={1.8}
                  dot={false}
                  connectNulls={false}
                  name="upload"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Throughput Over Time Chart */}
      {(isRunning || phase === "complete") && displayThroughputPoints.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-1 text-lg font-semibold text-text-primary">Throughput Over Time</h2>
          <p className="mb-4 text-xs text-text-secondary">
            Download and upload speeds measured throughout the test.
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              Download
            </span>
            <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
              Upload
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayThroughputPoints} margin={{ top: 8, right: 8, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                {throughputPhaseBands.map((band) => (
                  <ReferenceArea
                    key={`throughput-${band.phase}-${band.start}`}
                    x1={band.start}
                    x2={band.end}
                    ifOverflow="extendDomain"
                    fill={LATENCY_PHASE_STYLES[band.phase].area}
                    strokeOpacity={0}
                  />
                ))}
                <XAxis
                  type="number"
                  dataKey="time"
                  domain={[0, throughputDomainMax]}
                  stroke="var(--color-text-muted)"
                  tick={{ fontSize: 10 }}
                  tickFormatter={formatTimeTick}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: "Time (s)", position: "insideBottom", offset: -6, fill: "var(--color-text-muted)", fontSize: 10 }}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                  label={{ value: "Speed (Mbps)", angle: -90, position: "insideLeft", fill: "var(--color-text-muted)", fontSize: 10 }}
                />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => `${Number(v).toFixed(1)}s`} formatter={(v, name) => [`${Number(v).toFixed(2)} Mbps`, name]} />
                <Line type="linear" dataKey="download" stroke="#10b981" strokeWidth={2} dot={false} name="Download" connectNulls={false} isAnimationActive={false} />
                <Line type="linear" dataKey="upload" stroke="#f59e0b" strokeWidth={2} dot={false} name="Upload" connectNulls={false} isAnimationActive={false} />
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
    <div className="rounded-lg bg-surface-elevated p-4 text-center">
      <div className="text-[10px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className={cn("mt-1 text-2xl font-bold tabular-nums", color ?? "text-text-primary")}>
        {value != null ? value : "—"}
      </div>
      <div className="text-xs text-text-muted">{unit}</div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-elevated p-3">
      <div className="text-[10px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold text-text-primary">{value}</div>
    </div>
  );
}
