import { type NextRequest } from "next/server";

const UPSTREAM = "https://www.cloudflarestatus.com/api/v2";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const endpoint = path.join("/");

  const url = `${UPSTREAM}/${endpoint}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const body = await upstream.text();

    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "public, max-age=30, s-maxage=30",
      },
    });
  } catch {
    return Response.json(
      { error: "Failed to fetch Cloudflare status data" },
      { status: 502 }
    );
  }
}
