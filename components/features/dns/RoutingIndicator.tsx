"use client";

import { useEffect, useState } from "react";

interface TraceInfo {
  colo: string;
  loc: string;
}

export function RoutingIndicator() {
  const [info, setInfo] = useState<TraceInfo | null>(null);

  useEffect(() => {
    fetch("/api/trace")
      .then((r) => r.json())
      .then((data) => {
        setInfo({
          colo: data.colo ?? "Unknown",
          loc: data.country ?? data.loc ?? "Unknown",
        });
      })
      .catch(() => {});
  }, []);

  if (!info) return null;

  return (
    <div className="animate-fade-up mt-6 text-center text-[13px]" style={{ animationDelay: "100ms" }}>
      <p className="text-[#888]">
        Your ISP routed you through{" "}
        <span className="font-medium text-[#3f83f8]">{info.colo}</span>.
      </p>
      <p className="text-[#888]">
        We have processed your request in {info.colo}.
      </p>
      <p className="mt-1 text-[11px] italic text-[#555]">
        These are separate indicators that tell you where your request originated and where it was handled.
        They could point to two different locations, but that is very unlikely.
      </p>
    </div>
  );
}
