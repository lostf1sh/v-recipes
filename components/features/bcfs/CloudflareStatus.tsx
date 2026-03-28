"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface CfPage { name: string; updated_at: string }
interface CfStatus { indicator: string; description: string }
interface CfComponent { id: string; name: string; status: string; group: boolean; group_id: string | null }
interface CfUpdate { body: string; created_at: string }
interface CfIncident { id: string; name: string; status: string; impact: string; shortlink?: string; components?: CfComponent[]; incident_updates?: CfUpdate[] }
interface CfMaintenance { id: string; name: string; status: string; impact: string; scheduled_for?: string; scheduled_until?: string; components?: CfComponent[]; incident_updates?: CfUpdate[] }
interface CfSummary { page: CfPage; status: CfStatus; components: CfComponent[]; incidents: CfIncident[] }
interface CompGroup { group: { name: string }; components: CfComponent[] }

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

const API = "/api/cfstatus";

async function api<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${API}/${path}`);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min${m > 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const STATUS_MAP: Record<string, { text: string; cls: string }> = {
  operational:           { text: "Operational",         cls: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5" },
  partial_outage:        { text: "Re-routed",           cls: "text-amber-400 border-amber-400/20 bg-amber-400/5" },
  under_maintenance:     { text: "Partially Re-routed", cls: "text-orange-400 border-orange-400/20 bg-orange-400/5" },
  major_outage:          { text: "Offline",             cls: "text-red-400 border-red-400/20 bg-red-400/5" },
  degraded_performance:  { text: "Degraded",            cls: "text-yellow-400 border-yellow-400/20 bg-yellow-400/5" },
};

function statusBadge(status: string) {
  const s = STATUS_MAP[status] ?? { text: status.replace(/_/g, " "), cls: "text-[#888] border-[#1a1a1a]" };
  return <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium", s.cls)}>{s.text}</span>;
}

function indicatorDot(indicator: string) {
  const c = indicator === "critical" ? "bg-red-500" : indicator === "major" ? "bg-orange-500" : indicator === "minor" ? "bg-amber-500" : "bg-emerald-500";
  return <span className={cn("relative flex h-3 w-3")}>
    <span className={cn("absolute inset-0 animate-ping rounded-full opacity-40", c)} />
    <span className={cn("relative h-3 w-3 rounded-full", c)} />
  </span>;
}

function groupComps(summary: CfSummary): CompGroup[] {
  const groups = summary.components.filter(c => c.group);
  const items = summary.components.filter(c => !c.group);
  const map: Record<string, CompGroup> = {};
  groups.forEach(g => { map[g.id] = { group: g, components: [] }; });
  items.forEach(c => {
    if (c.group_id && map[c.group_id]) map[c.group_id].components.push(c);
    else {
      if (!map._u) map._u = { group: { name: "Other" }, components: [] };
      map._u.components.push(c);
    }
  });
  return Object.values(map);
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function CompGroupCard({ g }: { g: CompGroup }) {
  const isServices = g.group.name === "Cloudflare Sites and Services";
  const label = isServices ? "service" : "location";
  const issues = g.components.filter(c => c.status !== "operational").length;
  const INITIAL_SHOW = 12;
  const [showAll, setShowAll] = useState(g.components.length <= INITIAL_SHOW);

  // Always show issues first, then operational
  const sorted = [
    ...g.components.filter(c => c.status !== "operational"),
    ...g.components.filter(c => c.status === "operational"),
  ];
  const visible = showAll ? sorted : sorted.slice(0, INITIAL_SHOW);
  const hiddenCount = sorted.length - visible.length;

  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#ededed]">{g.group.name}</h3>
        <div className="flex items-center gap-2">
          {issues > 0 && (
            <span className="rounded-full border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 text-[11px] font-medium text-amber-400">
              {issues} issue{issues !== 1 ? "s" : ""}
            </span>
          )}
          <span className="text-[11px] text-[#555]">{g.components.length} {label}{g.components.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div>
        {visible.map(c => (
          <div key={c.id} className="flex items-center justify-between border-t border-[#1a1a1a] py-2.5 first:border-0 first:pt-0">
            <span className="truncate text-[13px] text-[#888]">{c.name}</span>
            {statusBadge(c.status)}
          </div>
        ))}
      </div>
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 w-full rounded-md bg-[#111] py-2 text-[12px] text-[#3f83f8] transition-colors hover:bg-[#1a1a1a] cursor-pointer"
        >
          Show {hiddenCount} more {label}{hiddenCount !== 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

function IncidentCard({ item, timePrefix }: { item: CfIncident; timePrefix: string }) {
  const [expanded, setExpanded] = useState(false);
  const upd = item.incident_updates?.[0];
  const body = upd?.body ?? "";
  const long = body.length > 150;
  const impactStyles = {
    critical: { border: "border-l-red-500", badge: "border-red-500/30 bg-red-500/10 text-red-400" },
    major:    { border: "border-l-orange-500", badge: "border-orange-500/30 bg-orange-500/10 text-orange-400" },
    minor:    { border: "border-l-amber-500", badge: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
    none:     { border: "border-l-[#333]", badge: "border-[#333] bg-[#111] text-[#888]" },
  }[item.impact] ?? { border: "border-l-[#333]", badge: "border-[#333] bg-[#111] text-[#888]" };

  const statusLabel = item.status?.replace(/_/g, " ") ?? "";

  return (
    <div className={cn("border-l-2 py-2.5 pl-4", impactStyles.border)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-[#ededed]">
          {item.shortlink ? <a href={item.shortlink} target="_blank" rel="noopener noreferrer" className="hover:text-[#3f83f8] transition-colors">{item.name}</a> : item.name}
        </p>
        {statusLabel && (
          <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", impactStyles.badge)}>
            {statusLabel}
          </span>
        )}
      </div>
      {upd?.created_at && <p className="mt-0.5 text-[11px] text-[#555]">{timePrefix} {relTime(upd.created_at)}</p>}
      {item.components && item.components.length > 0 && (
        <p className="mt-1 text-[11px] text-[#555]">Affected: {item.components.map(c => c.name).join(", ")}</p>
      )}
      {body && (
        <div className="mt-2">
          <p className="whitespace-pre-line text-[12px] leading-relaxed text-[#888]">
            {expanded ? body : long ? body.slice(0, 150) + "\u2026" : body}
          </p>
          {long && (
            <button onClick={() => setExpanded(!expanded)} className="mt-1 text-[11px] text-[#3f83f8] hover:text-[#5a9aff] cursor-pointer">
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MaintCard({ m }: { m: CfMaintenance }) {
  const [expanded, setExpanded] = useState(false);
  const upd = m.incident_updates?.[0];
  const body = upd?.body ?? "";
  const long = body.length > 150;

  let timeStr = "";
  if (m.scheduled_for && m.scheduled_until) {
    const start = new Date(m.scheduled_for);
    const end = new Date(m.scheduled_until);
    const durH = Math.round((end.getTime() - start.getTime()) / 3600000);
    timeStr = `Starts ${relTime(m.scheduled_for)}${durH > 0 ? ` (${durH}h duration)` : ""}`;
  } else if (m.scheduled_for) {
    timeStr = `Scheduled: ${relTime(m.scheduled_for)}`;
  }

  const borderCls = m.impact === "critical" ? "border-l-red-500" : m.impact === "major" ? "border-l-orange-500" : m.impact === "minor" ? "border-l-amber-500" : "border-l-[#333]";

  return (
    <div className={cn("border-l-2 py-2.5 pl-4", borderCls)}>
      <p className="text-[13px] font-medium text-[#ededed]">{m.name}</p>
      {timeStr && <p className="mt-0.5 text-[11px] text-[#555]">{timeStr}</p>}
      {m.components && m.components.length > 0 && (
        <p className="mt-1 text-[11px] text-[#555]">Affected: {m.components.map(c => c.name).join(", ")}</p>
      )}
      {body && (
        <div className="mt-2">
          <p className="whitespace-pre-line text-[12px] leading-relaxed text-[#888]">
            {expanded ? body : long ? body.slice(0, 150) + "\u2026" : body}
          </p>
          {long && (
            <button onClick={() => setExpanded(!expanded)} className="mt-1 text-[11px] text-[#3f83f8] hover:text-[#5a9aff] cursor-pointer">
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-5">
      <h3 className="mb-3 text-sm font-semibold text-[#ededed]">{title}</h3>
      {children}
    </div>
  );
}

function TruncatedSection({ title, initialShow, children }: { title: string; initialShow: number; children: React.ReactNode[] }) {
  const [showAll, setShowAll] = useState(children.length <= initialShow);
  const visible = showAll ? children : children.slice(0, initialShow);
  const hiddenCount = children.length - visible.length;

  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#ededed]">{title}</h3>
        <span className="text-[11px] text-[#555]">{children.length} item{children.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="space-y-1">{visible}</div>
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 w-full rounded-md bg-[#111] py-2 text-[12px] text-[#3f83f8] transition-colors hover:bg-[#1a1a1a] cursor-pointer"
        >
          Show {hiddenCount} more
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

export function CloudflareStatus() {
  const [summary, setSummary] = useState<CfSummary | null>(null);
  const [incidents, setIncidents] = useState<CfIncident[]>([]);
  const [upMaint, setUpMaint] = useState<CfMaintenance[]>([]);
  const [actMaint, setActMaint] = useState<CfMaintenance[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, i, u, a] = await Promise.all([
      api<CfSummary>("summary.json"),
      api<{ incidents: CfIncident[] }>("incidents.json"),
      api<{ scheduled_maintenances: CfMaintenance[] }>("scheduled-maintenances/upcoming.json"),
      api<{ scheduled_maintenances: CfMaintenance[] }>("scheduled-maintenances/active.json"),
    ]);
    if (s) setSummary(s);
    setIncidents(i?.incidents ?? []);
    setUpMaint(u?.scheduled_maintenances ?? []);
    setActMaint(a?.scheduled_maintenances ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      setLoading(true);
      load();
    }
  }, [initialized, load]);

  const groups = summary ? groupComps(summary) : [];
  const activeInc = summary?.incidents ?? [];
  const pastInc = incidents.filter(i => i.status === "resolved" || i.status === "postmortem").slice(0, 20);

  return (
    <div className="space-y-5">
      {/* Top status bar */}
      <div className="flex items-center justify-between rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] px-5 py-4 animate-fade-up">
        {summary ? (
          <div className="flex items-center gap-3">
            {indicatorDot(summary.status.indicator)}
            <div>
              <p className="text-sm font-medium text-[#ededed]">{summary.status.description}</p>
              <p className="text-[11px] text-[#555]">Updated {relTime(summary.page.updated_at)}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#555]">{loading ? "Loading status\u2026" : "Unable to load"}</p>
        )}
        <button
          onClick={load}
          disabled={loading || undefined}
          className={cn(
            "rounded-md border border-[#1a1a1a] px-3 py-1.5 text-[12px] font-medium text-[#888] transition-colors hover:border-[#333] hover:text-[#ededed] cursor-pointer",
            loading && "opacity-50 pointer-events-none"
          )}
        >
          {loading ? "Loading\u2026" : "Refresh"}
        </button>
      </div>

      {/* Component groups - 2 column */}
      {groups.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 animate-fade-up" style={{ animationDelay: "100ms" }}>
          {groups.map(g => <CompGroupCard key={g.group.name} g={g} />)}
        </div>
      )}

      {/* Active issues - full width */}
      {activeInc.length > 0 && (
        <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <SectionCard title="Active Incidents">
            <div className="space-y-1">{activeInc.slice(0, 10).map(i => <IncidentCard key={i.id} item={i} timePrefix="Updated" />)}</div>
          </SectionCard>
        </div>
      )}

      {actMaint.length > 0 && (
        <div className="animate-fade-up" style={{ animationDelay: "250ms" }}>
          <SectionCard title="Active Maintenance">
            <div className="space-y-1">{actMaint.slice(0, 10).map(m => <MaintCard key={m.id} m={m} />)}</div>
          </SectionCard>
        </div>
      )}

      {/* Upcoming maintenance + past incidents side by side with show more */}
      {(upMaint.length > 0 || pastInc.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2 animate-fade-up" style={{ animationDelay: "300ms" }}>
          {upMaint.length > 0 && (
            <TruncatedSection title="Upcoming Maintenance" initialShow={5}>
              {upMaint.map(m => <MaintCard key={m.id} m={m} />)}
            </TruncatedSection>
          )}
          {pastInc.length > 0 && (
            <TruncatedSection title="Past Incidents" initialShow={5}>
              {pastInc.map(i => <IncidentCard key={i.id} item={i} timePrefix="Resolved" />)}
            </TruncatedSection>
          )}
        </div>
      )}
    </div>
  );
}
