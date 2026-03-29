/**
 * Extract PoP / colo code from Cloudflare's CF-Ray response header.
 * Typical shape: `<hex>-<COLO>` (e.g. …-SIN). Last segment is the edge code.
 */
export function parseColoFromCfRayHeader(cfRay: string | null | undefined): string | undefined {
  if (!cfRay || typeof cfRay !== "string") return undefined;
  const parts = cfRay.split("-");
  if (parts.length < 2) return undefined;
  const last = parts[parts.length - 1]?.trim();
  if (!last || !/^[A-Za-z]{3,5}$/.test(last)) return undefined;
  return last.toUpperCase();
}

/**
 * Map Cloudflare Status API component names to colo codes (IST, SIN, …).
 */
export function buildColoMap(components: { name: string }[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const c of components) {
    const match = c.name.match(/\(([A-Z0-9]{3,5})\)/);
    if (!match) continue;
    const code = match[1];
    const name = c.name
      .split(`(${code})`)[0]
      .replace(/\s*-\s*$/, "")
      .trim();
    if (code && name) map[code] = name;
  }
  return map;
}

export function formatEdgeColoLabel(coloMap: Record<string, string>, code: string): string {
  if (!code) return "Unknown";
  const name = coloMap[code];
  return name ? `${name} (${code})` : code;
}

/** Human-readable Cloudflare edge / PoP label for a colo code. */
export async function fetchEdgeLocationLabel(coloCode: string | undefined): Promise<string> {
  const code = coloCode?.trim();
  if (!code || code === "Unknown") return "Unknown";
  try {
    const res = await fetch("/api/cfstatus/components.json", { cache: "no-store" });
    if (!res.ok) return code;
    const data = await res.json();
    const map = buildColoMap(data.components ?? []);
    return formatEdgeColoLabel(map, code);
  } catch {
    return code;
  }
}
