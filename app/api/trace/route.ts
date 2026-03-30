import { type NextRequest } from "next/server";
import { parseColoFromCfRayHeader } from "@/lib/cfColo";
import { isNonPublicIp } from "@/lib/geo";

export const dynamic = "force-dynamic";

function getClientIp(request: NextRequest): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf?.trim()) return cf.trim();

  const trueClient = request.headers.get("true-client-ip");
  if (trueClient?.trim()) return trueClient.trim();

  const xff = request.headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  if (first) return first;

  const real = request.headers.get("x-real-ip");
  if (real?.trim()) return real.trim();

  return "";
}

async function fetchIpinfoForIp(ip: string): Promise<Record<string, string>> {
  if (!ip || ip === "Unknown") return {};
  try {
    const res = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}/json`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

/** Fallback when no client IP (e.g. local dev): outbound trace is server-side only — not the visitor. */
async function fetchTraceFallback(): Promise<Record<string, string>> {
  const urls = [
    "https://v.recipes/cdn-cgi/trace",
    "https://cloudflare.com/cdn-cgi/trace",
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const text = await res.text();
      return Object.fromEntries(
        text
          .split("\n")
          .filter(Boolean)
          .map((l) => {
            const [k, ...v] = l.split("=");
            return [k, v.join("=")];
          })
      );
    } catch {
      // try next
    }
  }
  return {};
}

function parseCoordinates(loc?: string): [number | null, number | null] {
  if (!loc) return [null, null];

  const [lat, lon] = loc.split(",").map((value) => Number(value.trim()));
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return [null, null];
  }

  return [lat, lon];
}

export async function GET(request: NextRequest) {
  const rawIp = getClientIp(request);
  const clientIp = rawIp && !isNonPublicIp(rawIp) ? rawIp : "";

  let traceFallback: Record<string, string> = {};
  let ipinfo: Record<string, string> = {};

  if (clientIp) {
    ipinfo = await fetchIpinfoForIp(clientIp);
  } else {
    traceFallback = await fetchTraceFallback();
    const fallbackIp = traceFallback.ip?.trim() ?? "";
    const fb = fallbackIp && !isNonPublicIp(fallbackIp) ? fallbackIp : "";
    ipinfo = await fetchIpinfoForIp(fb);
  }

  const traceIp = traceFallback.ip?.trim() ?? "";
  const ipFromInfo = typeof ipinfo.ip === "string" && ipinfo.ip ? ipinfo.ip : "";
  const ip =
    clientIp ||
    (ipFromInfo && !isNonPublicIp(ipFromInfo) ? ipFromInfo : "") ||
    (traceIp && !isNonPublicIp(traceIp) ? traceIp : "") ||
    "Unknown";

  const coloFromIncomingRay = parseColoFromCfRayHeader(request.headers.get("cf-ray"));

  const [latitude, longitude] = parseCoordinates(ipinfo.loc);

  const merged = {
    ip,
    colo: coloFromIncomingRay ?? "Unknown",
    loc: traceFallback.loc ?? ipinfo.country ?? "Unknown",
    isp: ipinfo.org ?? "Unknown",
    city: ipinfo.city ?? "",
    region: ipinfo.region ?? "",
    country: ipinfo.country ?? traceFallback.loc ?? "",
    warp: traceFallback.warp ?? "off",
    http: traceFallback.http ?? "",
    latitude,
    longitude,
  };

  return Response.json(merged);
}
