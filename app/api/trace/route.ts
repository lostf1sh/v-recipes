export async function GET() {
  // Fetch both CF trace and ipinfo in parallel for complete connection info
  const [traceResult, ipinfoResult] = await Promise.allSettled([
    fetchTrace(),
    fetchIpinfo(),
  ]);

  const trace =
    traceResult.status === "fulfilled" ? traceResult.value : {};
  const ipinfo =
    ipinfoResult.status === "fulfilled" ? ipinfoResult.value : {};

  const merged = {
    ip: trace.ip ?? ipinfo.ip ?? "Unknown",
    colo: trace.colo ?? "Unknown",
    loc: trace.loc ?? ipinfo.country ?? "Unknown",
    isp: ipinfo.org ?? "Unknown",
    city: ipinfo.city ?? "",
    region: ipinfo.region ?? "",
    country: ipinfo.country ?? trace.loc ?? "",
    warp: trace.warp ?? "off",
    http: trace.http ?? "",
  };

  return Response.json(merged);
}

async function fetchTrace(): Promise<Record<string, string>> {
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

async function fetchIpinfo(): Promise<Record<string, string>> {
  try {
    const res = await fetch("https://ipinfo.io/json", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}
