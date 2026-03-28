"use client";

import { useEffect, useState } from "react";

// Common Cloudflare colo codes to city names
const COLO_NAMES: Record<string, string> = {
  AMS: "Amsterdam", ATL: "Atlanta", BOS: "Boston", CDG: "Paris", DEN: "Denver",
  DFW: "Dallas", EWR: "Newark", FRA: "Frankfurt", GRU: "São Paulo",
  HKG: "Hong Kong", IAD: "Ashburn", IAH: "Houston", ICN: "Seoul",
  JNB: "Johannesburg", LAX: "Los Angeles", LHR: "London", MIA: "Miami",
  NRT: "Tokyo", ORD: "Chicago", PHX: "Phoenix", SEA: "Seattle",
  SIN: "Singapore", SJC: "San Jose", SYD: "Sydney", YYZ: "Toronto",
  IST: "Istanbul", BOM: "Mumbai", DEL: "Delhi", MEL: "Melbourne",
  MXP: "Milan", ARN: "Stockholm", WAW: "Warsaw", VIE: "Vienna",
  ZRH: "Zurich", MAD: "Madrid", LIS: "Lisbon", OSL: "Oslo",
  HEL: "Helsinki", CPH: "Copenhagen", DUB: "Dublin", BRU: "Brussels",
  MNL: "Manila", KUL: "Kuala Lumpur", BKK: "Bangkok", CGK: "Jakarta",
  TPE: "Taipei", KIX: "Osaka", NVT: "Navegantes",
};

function coloToCity(colo: string): string {
  return COLO_NAMES[colo] ?? colo;
}

interface TraceData {
  city: string;
  colo: string;
}

export function RoutingIndicator() {
  const [data, setData] = useState<TraceData | null>(null);

  useEffect(() => {
    fetch("/api/trace")
      .then((r) => r.json())
      .then((d) => setData({ city: d.city ?? "", colo: d.colo ?? "" }))
      .catch(() => {});
  }, []);

  if (!data) return null;

  const coloCity = coloToCity(data.colo);
  const userCity = data.city || "your location";

  return (
    <div className="animate-fade-up mt-6 text-center text-[13px]" style={{ animationDelay: "100ms" }}>
      <p className="text-[#888]">
        Your ISP routed you through{" "}
        <span className="font-medium text-[#3f83f8]">{coloCity} ({data.colo})</span>.
      </p>
      <p className="text-[#888]">
        We have processed your request in {coloCity} ({data.colo}).
      </p>
      <p className="mt-1 text-[11px] italic text-[#555]">
        These are separate indicators that tell you where your request originated and where it was handled.
        They could point to two different locations, but that is very unlikely.
      </p>
    </div>
  );
}
