/**
 * True for loopback, link-local, and common private LAN ranges (IPv4/IPv6).
 * Used so we never treat dev (::1) as the visitor for geo lookups.
 */
export function isNonPublicIp(ip: string | undefined | null): boolean {
  if (ip == null || ip === "" || ip === "Unknown") return true;
  const t = ip.trim().toLowerCase();
  if (t === "localhost") return true;
  if (t === "::1") return true;
  if (t === "127.0.0.1") return true;
  if (t.startsWith("::ffff:127.")) return true;
  if (t.startsWith("10.")) return true;
  if (t.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(t)) return true;
  if (t.startsWith("fe80:")) return true;
  if (t.startsWith("fc") || t.startsWith("fd")) return true;
  return false;
}

/** Browser → ipinfo: returns visitor's public IP and geo (works behind NAT; not for SSR). */
export async function fetchIpinfoFromBrowser(): Promise<Record<string, string> | null> {
  try {
    const res = await fetch("https://ipinfo.io/json", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
