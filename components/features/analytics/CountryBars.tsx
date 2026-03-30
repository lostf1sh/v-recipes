"use client";

import Image from "next/image";
import type { CountryEntry } from "@/lib/types";
import { formatNumber, formatBytes } from "@/lib/format";

const FLAG_BASE = "https://flagcdn.com/16x12";

// Map common ISO codes to full country names
const countryNames: Record<string, string> = {
  AF: "Afghanistan", AL: "Albania", DZ: "Algeria", AD: "Andorra", AO: "Angola",
  AR: "Argentina", AM: "Armenia", AU: "Australia", AT: "Austria", AZ: "Azerbaijan",
  BD: "Bangladesh", BY: "Belarus", BE: "Belgium", BR: "Brazil", BG: "Bulgaria",
  KH: "Cambodia", CA: "Canada", CL: "Chile", CN: "China", CO: "Colombia",
  HR: "Croatia", CU: "Cuba", CY: "Cyprus", CZ: "Czechia", DK: "Denmark",
  EC: "Ecuador", EG: "Egypt", EE: "Estonia", ET: "Ethiopia", FI: "Finland",
  FR: "France", GE: "Georgia", DE: "Germany", GH: "Ghana", GR: "Greece",
  HK: "Hong Kong", HU: "Hungary", IS: "Iceland", IN: "India", ID: "Indonesia",
  IR: "Iran", IQ: "Iraq", IE: "Ireland", IL: "Israel", IT: "Italy",
  JP: "Japan", JO: "Jordan", KZ: "Kazakhstan", KE: "Kenya", KR: "South Korea",
  KW: "Kuwait", LV: "Latvia", LB: "Lebanon", LT: "Lithuania", LU: "Luxembourg",
  MY: "Malaysia", MX: "Mexico", MD: "Moldova", MN: "Mongolia", MA: "Morocco",
  MM: "Myanmar", NP: "Nepal", NL: "Netherlands", NZ: "New Zealand", NG: "Nigeria",
  NO: "Norway", PK: "Pakistan", PA: "Panama", PE: "Peru", PH: "Philippines",
  PL: "Poland", PT: "Portugal", QA: "Qatar", RO: "Romania", RU: "Russia",
  SA: "Saudi Arabia", RS: "Serbia", SG: "Singapore", SK: "Slovakia", SI: "Slovenia",
  ZA: "South Africa", ES: "Spain", LK: "Sri Lanka", SE: "Sweden", CH: "Switzerland",
  TW: "Taiwan", TH: "Thailand", TR: "Turkey", UA: "Ukraine", AE: "UAE",
  GB: "United Kingdom", US: "United States", UY: "Uruguay", UZ: "Uzbekistan",
  VN: "Vietnam", VE: "Venezuela", YE: "Yemen",
};

function getCountryName(code: string): string {
  if (!code) return "Unknown";
  // Try our map first, then Intl.DisplayNames as fallback
  if (countryNames[code]) return countryNames[code];
  try {
    const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code);
    if (name) return name;
  } catch { /* fallback */ }
  return code;
}

interface CountryBarsProps {
  data: CountryEntry[];
}

export function CountryBars({ data }: CountryBarsProps) {
  if (!Array.isArray(data)) return null;
  const sorted = [...data].sort((a, b) => b.requests - a.requests).slice(0, 12);
  const maxRequests = sorted[0]?.requests ?? 1;

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="mb-4 text-lg font-bold text-text-primary">
        Requests Volume by Country
      </h3>
      <div className="space-y-2.5">
        {sorted.map((entry) => {
          const code = entry.name?.toUpperCase() ?? "";
          const fullName = getCountryName(code);
          return (
            <div key={entry.name} className="group">
              <div className="mb-1 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-text-primary">
                  {code && (
                    <Image
                      src={`${FLAG_BASE}/${code.toLowerCase()}.png`}
                      alt={code}
                      width={16}
                      height={12}
                      className="rounded-[2px]"
                      unoptimized
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <span className="truncate">{fullName}</span>
                </span>
                <div className="ml-2 flex shrink-0 flex-col items-end">
                  <span className="text-xs tabular-nums text-accent">
                    {formatNumber(entry.requests)} requests
                  </span>
                  <span className="text-[10px] tabular-nums text-text-muted">
                    {formatBytes(entry.bytes)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full bg-[#3f83f8] transition-all duration-500"
                  style={{
                    width: `${(entry.requests / maxRequests) * 100}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-xs text-text-muted">No data available</p>
        )}
      </div>
    </div>
  );
}
