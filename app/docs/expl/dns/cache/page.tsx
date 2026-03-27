import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Cache Efficiency Illustration",
  description:
    "Visual explanation of v.recipes multi-layer DNS caching — L1 edge cache, L2 regional cache, and upstream resolution.",
};

function CacheNode({
  label,
  sublabel,
  color,
  pulse,
}: {
  label: string;
  sublabel: string;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative flex h-20 w-20 items-center justify-center rounded-lg border-2 sm:h-24 sm:w-24 ${color}`}
      >
        {pulse && (
          <div
            className={`absolute inset-0 rounded-lg ${color} animate-[ping_2s_ease-in-out_infinite] opacity-20`}
          />
        )}
        <span className="relative z-10 text-xs font-bold sm:text-sm">
          {label}
        </span>
      </div>
      <span className="text-xs text-text-muted">{sublabel}</span>
    </div>
  );
}

function Arrow({
  direction,
  label,
  color,
  dashed,
}: {
  direction: "right" | "left";
  label: string;
  color: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-[10px] font-medium ${color}`}>{label}</span>
      <div className="flex items-center">
        {direction === "left" && (
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            className={color}
            fill="currentColor"
          >
            <path d="M8 4L0 0v8z" />
          </svg>
        )}
        <div
          className={`h-0.5 w-8 sm:w-14 ${dashed ? "" : color.replace("text-", "bg-")}`}
          style={
            dashed
              ? {
                  backgroundImage: `repeating-linear-gradient(90deg, currentColor 0px, currentColor 4px, transparent 4px, transparent 8px)`,
                  backgroundSize: "8px 2px",
                  backgroundColor: "transparent",
                  color: "var(--color-warning)",
                }
              : undefined
          }
        />
        {direction === "right" && (
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            className={color}
            fill="currentColor"
          >
            <path d="M0 4l8-4v8z" />
          </svg>
        )}
      </div>
    </div>
  );
}

function ScenarioFlow({
  title,
  badge,
  description,
  steps,
}: {
  title: string;
  badge: { label: string; variant: "success" | "warning" | "info" };
  description: string;
  steps: string[];
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-3">
        <h3 className="text-base font-semibold text-text-primary">{title}</h3>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-[10px] font-bold text-text-muted">
              {i + 1}
            </span>
            <span className="text-sm text-text-secondary">{step}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function CacheIllustrationPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <header className="animate-fade-up mb-12" style={{ animationDelay: "0ms" }}>
        <div className="mb-4 flex items-center gap-2">
          <Link
            href="/dns"
            className="text-sm text-text-muted transition-colors hover:text-accent"
          >
            DNS
          </Link>
          <span className="text-text-muted">/</span>
          <Link
            href="/docs/expl/dns"
            className="text-sm text-text-muted transition-colors hover:text-accent"
          >
            Illustrations
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-sm text-text-secondary">Cache Efficiency</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Cache Efficiency
        </h1>
        <p className="mt-3 text-text-secondary">
          How v.recipes uses a multi-layer caching strategy to answer DNS
          queries as close to the edge as possible, minimising upstream lookups.
        </p>
      </header>

      {/* Main Diagram */}
      <section className="animate-fade-up mb-12" style={{ animationDelay: "100ms" }}>
        <Card className="overflow-hidden">
          <div className="mb-6 text-center">
            <Badge variant="accent">Multi-Layer Cache Architecture</Badge>
          </div>

          {/* Visual Flow */}
          <div className="flex flex-col items-center gap-6 py-4">
            {/* Client Row */}
            <div className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-muted text-accent">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-primary">
                Client DNS Query
              </span>
            </div>

            {/* Down arrow */}
            <div className="flex flex-col items-center">
              <div className="h-6 w-0.5 bg-success" />
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                className="text-success"
                fill="currentColor"
              >
                <path d="M4 8L0 0h8z" />
              </svg>
              <span className="mt-1 text-[10px] text-success">Request</span>
            </div>

            {/* Cache Layers */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <CacheNode
                label="L1"
                sublabel="Edge Cache"
                color="border-success/60 bg-success/5 text-success"
                pulse
              />
              <Arrow
                direction="right"
                label="MISS"
                color="text-warning"
                dashed
              />
              <CacheNode
                label="L2"
                sublabel="Regional Cache"
                color="border-info/60 bg-info/5 text-info"
                pulse
              />
              <Arrow
                direction="right"
                label="MISS"
                color="text-warning"
                dashed
              />
              <CacheNode
                label="DNS"
                sublabel="Upstream"
                color="border-text-muted/40 bg-surface-elevated text-text-secondary"
              />
            </div>

            {/* Response flow */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <div className="flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
                <span className="text-[10px] text-success">Store + Reply</span>
              </div>
              <Arrow direction="left" label="FILL" color="text-info" />
              <div className="flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
                <span className="text-[10px] text-info">Store + Reply</span>
              </div>
              <Arrow direction="left" label="RESPONSE" color="text-info" />
              <div className="flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
                <span className="text-[10px] text-text-muted">Resolve</span>
              </div>
            </div>

            {/* Up arrow */}
            <div className="flex flex-col items-center">
              <span className="mb-1 text-[10px] text-info">Response</span>
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                className="text-info"
                fill="currentColor"
              >
                <path d="M4 0L0 8h8z" />
              </svg>
              <div className="h-6 w-0.5 bg-info" />
            </div>

            {/* Client Response */}
            <div className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-info/10 text-info">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-primary">
                Response Delivered
              </span>
            </div>
          </div>
        </Card>
      </section>

      {/* Scenario Cards */}
      <section className="animate-fade-up mb-12" style={{ animationDelay: "200ms" }}>
        <h2 className="mb-6 text-2xl font-semibold text-text-primary">
          Cache Lookup Scenarios
        </h2>
        <div className="space-y-4">
          <ScenarioFlow
            title="L1 Cache Hit"
            badge={{ label: "Fastest", variant: "success" }}
            description="The domain was recently resolved by this Worker isolate. The response is served directly from in-memory storage."
            steps={[
              "Client sends DNS query to v.recipes.",
              "L1 (edge) cache has a fresh entry for this domain.",
              "Response returned immediately from memory — sub-millisecond overhead.",
              "No L2 lookup, no upstream query. Fastest possible path.",
            ]}
          />
          <ScenarioFlow
            title="L2 Cache Hit"
            badge={{ label: "Fast", variant: "info" }}
            description="The L1 cache missed (isolate was cold or entry expired), but another Worker in the same data centre had the answer."
            steps={[
              "Client sends DNS query to v.recipes.",
              "L1 cache miss — entry absent or expired in this isolate.",
              "L2 (regional) cache is checked via Cloudflare Cache API.",
              "L2 returns a valid response. L1 is backfilled for next time.",
              "Response returned to client — typically <5ms overhead.",
            ]}
          />
          <ScenarioFlow
            title="Full Cache Miss"
            badge={{ label: "Upstream", variant: "warning" }}
            description="Neither cache layer has the answer. The query is forwarded to the upstream resolver, and the result is stored in both layers."
            steps={[
              "Client sends DNS query to v.recipes.",
              "L1 cache miss — no entry in this isolate.",
              "L2 cache miss — no entry in this data centre.",
              "Query forwarded to the upstream resolver (e.g., Cloudflare 1.1.1.1).",
              "Upstream responds. Result stored in both L2 and L1.",
              "Response returned to client. Subsequent queries hit cache.",
            ]}
          />
        </div>
      </section>

      {/* Hit Rate Stats */}
      <section className="animate-fade-up mb-12" style={{ animationDelay: "300ms" }}>
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Typical Cache Performance
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-success/5 p-4 text-center">
              <div className="text-3xl font-bold text-success">&gt;90%</div>
              <div className="mt-1 text-xs text-text-muted">
                Overall Hit Rate
              </div>
            </div>
            <div className="rounded-lg bg-info/5 p-4 text-center">
              <div className="text-3xl font-bold text-info">&lt;1ms</div>
              <div className="mt-1 text-xs text-text-muted">
                L1 Hit Latency
              </div>
            </div>
            <div className="rounded-lg bg-accent/5 p-4 text-center">
              <div className="text-3xl font-bold text-accent">&lt;5ms</div>
              <div className="mt-1 text-xs text-text-muted">
                L2 Hit Latency
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            Because most DNS queries are for popular domains (search engines,
            CDNs, social media), the vast majority of requests are served from
            the L1 or L2 cache without touching the upstream resolver. This
            reduces latency for users and eliminates unnecessary load on
            upstream providers.
          </p>
        </Card>
      </section>

      {/* Key Concepts */}
      <section className="animate-fade-up mb-12" style={{ animationDelay: "400ms" }}>
        <h2 className="mb-6 text-2xl font-semibold text-text-primary">
          Key Concepts
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                L1 Cache (Edge)
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              In-memory storage within the Worker isolate. Scoped to a single
              instance. Extremely fast but ephemeral &mdash; cleared when the
              isolate recycles.
            </p>
          </Card>
          <Card>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                L2 Cache (Regional)
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              Shared across all Workers in the same Cloudflare data centre via
              the Cache API. Persists longer than L1 and benefits all users
              routed to that PoP.
            </p>
          </Card>
          <Card>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                TTL Respect
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              Cache entries honour the TTL returned by the upstream resolver. Low
              TTL records expire quickly; high TTL records benefit from longer
              caching. Stale entries may be served briefly during revalidation.
            </p>
          </Card>
          <Card>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                Cache Backfill
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              When L2 serves a hit, the result is written back to L1 so the next
              query from the same isolate is even faster. This cascading fill
              keeps the hottest data at the closest layer.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <div className="animate-fade-up flex flex-wrap gap-3 border-t border-border pt-8" style={{ animationDelay: "500ms" }}>
        <Button href="/docs/expl/dns" variant="outline" size="sm">
          &larr; All Illustrations
        </Button>
        <Button href="/docs/dns" variant="outline" size="sm">
          Documentation
        </Button>
        <Button href="/docs/expl/dns/pacing" variant="outline" size="sm">
          Per-Request Pacing &rarr;
        </Button>
      </div>
    </div>
  );
}
