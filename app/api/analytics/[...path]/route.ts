import { type NextRequest } from "next/server";

const UPSTREAM = "https://v.recipes/analytics/api";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const endpoint = path.join("/");
  const { searchParams } = request.nextUrl;

  // Build upstream URL with query params
  const url = new URL(`${UPSTREAM}/${endpoint}`);
  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  // Forward client IP
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP =
    request.headers.get("x-real-ip") ?? forwarded?.split(",")[0]?.trim() ?? "";

  try {
    const upstream = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "X-Forwarded-For": realIP,
        "X-Real-IP": realIP,
      },
      cache: "no-store",
    });

    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return Response.json(
      { error: "Failed to fetch upstream analytics data" },
      { status: 502 }
    );
  }
}
