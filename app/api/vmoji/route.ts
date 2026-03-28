export async function GET() {
  try {
    const res = await fetch("https://v.recipes/api/discord/vmoji/availableemojis", {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 300 }, // cache 5 minutes
    });
    if (!res.ok) return Response.json({ ok: false, error: "upstream_error" }, { status: res.status });
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ ok: false, error: "fetch_failed" }, { status: 502 });
  }
}
