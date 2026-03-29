"use client";

import { useEffect, useState } from "react";
import { buildColoMap, formatEdgeColoLabel } from "@/lib/cfColo";

interface RouteInfo {
  userRoute: string;
  serverRoute: string;
}

function formatColo(coloMap: Record<string, string>, code: string, fallback: string): string {
  if (!code) return fallback;
  return formatEdgeColoLabel(coloMap, code);
}

export function RoutingIndicator() {
  const [route, setRoute] = useState<RouteInfo | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/trace").then((r) => r.json()).catch(() => ({})),
      fetch("/api/cfstatus/components.json").then((r) => r.json()).catch(() => ({ components: [] })),
    ]).then(([trace, status]) => {
      const coloMap = buildColoMap(status.components ?? []);
      const colo = trace.colo ?? "";

      setRoute({
        userRoute: formatColo(coloMap, colo, "Unknown Location"),
        serverRoute: formatColo(coloMap, colo, "Unknown Server"),
      });
    });
  }, []);

  if (!route) return null;

  return (
    <div className="animate-fade-up mt-6 text-center text-[13px]" style={{ animationDelay: "100ms" }}>
      <p className="text-[#888]">
        Your ISP routed you through{" "}
        <span className="font-medium text-[#3f83f8]">{route.userRoute}</span>.
      </p>
      <p className="text-[#888]">
        We have processed your request in {route.serverRoute}.
      </p>
      <p className="mt-1 text-[11px] italic text-[#555]">
        These are separate indicators that tell you where your request originated and where it was handled.
        They could point to two different locations, but that is very unlikely.
      </p>
    </div>
  );
}
