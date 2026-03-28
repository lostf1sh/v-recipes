"use client";

import { useEffect, useState } from "react";

interface TraceInfo {
  colo: string;
  city: string;
  region: string;
  country: string;
}

function formatLocation(info: TraceInfo): string {
  const parts = [info.city, info.colo ? `(${info.colo})` : ""].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return info.region || info.country || "Unknown";
}

export function RoutingIndicator() {
  const [info, setInfo] = useState<TraceInfo | null>(null);

  useEffect(() => {
    fetch("/api/trace")
      .then((r) => r.json())
      .then((data) => {
        setInfo({
          colo: data.colo ?? "",
          city: data.city ?? "",
          region: data.region ?? "",
          country: data.country ?? "",
        });
      })
      .catch(() => {});
  }, []);

  if (!info) return null;

  const location = formatLocation(info);

  return (
    <div className="animate-fade-up mt-6 text-center text-[13px]" style={{ animationDelay: "100ms" }}>
      <p className="text-[#888]">
        Your ISP routed you through{" "}
        <span className="font-medium text-[#3f83f8]">{location}</span>.
      </p>
      <p className="text-[#888]">
        We have processed your request in {location}.
      </p>
      <p className="mt-1 text-[11px] italic text-[#555]">
        These are separate indicators that tell you where your request originated and where it was handled.
        They could point to two different locations, but that is very unlikely.
      </p>
    </div>
  );
}
