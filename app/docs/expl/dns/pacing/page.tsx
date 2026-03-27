import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Per-Request Pacing Illustration",
  description:
    "Visual explanation of v.recipes per-request pacing — how a token-bucket rate limiter prevents upstream DNS congestion.",
};

function ClientIcon({ index }: { index: number }) {
  const delays = ["0s", "0.3s", "0.6s", "0.9s", "1.2s"];
  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{
        animation: `fadeSlideIn 0.4s ease-out ${delays[index]} both`,
      }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated text-text-secondary">
        <svg
          width="16"
          height="16"
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
      <span className="text-[10px] text-text-muted">Client {index + 1}</span>
    </div>
  );
}

function TokenBucket() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-28 w-48 flex-col items-center justify-end overflow-hidden rounded-lg border-2 border-accent/40 bg-accent/5 sm:h-32 sm:w-56">
        {/* Token fill level */}
        <div
          className="w-full bg-gradient-to-t from-accent/30 to-accent/10"
          style={{
            height: "65%",
            animation: "bucketPulse 3s ease-in-out infinite",
          }}
        />
        {/* Tokens as dots */}
        <div className="absolute inset-0 flex flex-wrap items-end justify-center gap-1 p-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-accent"
              style={{
                opacity: i < 8 ? 1 : 0.3,
                animation: `tokenFade 2s ease-in-out ${i * 0.15}s infinite alternate`,
              }}
            />
          ))}
        </div>
        {/* Label overlay */}
        <div className="absolute inset-x-0 top-2 text-center">
          <span className="text-[10px] font-bold tracking-wider text-accent/80">
            TOKEN BUCKET
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-xs font-medium text-text-primary">
          1,000 tokens/s
        </div>
        <div className="text-[10px] text-text-muted">Refill rate</div>
      </div>
    </div>
  );
}

function PacingStep({
  number,
  title,
  description,
  color,
}: {
  number: number;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${color} text-sm font-bold`}
      >
        {number}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
        <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function PacingIllustrationPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Inline keyframes */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes bucketPulse {
              0%, 100% { height: 65%; }
              50% { height: 55%; }
            }
            @keyframes tokenFade {
              from { opacity: 0.4; }
              to { opacity: 1; }
            }
            @keyframes flowDot {
              0% { transform: translateX(0); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateX(80px); opacity: 0; }
            }
            @keyframes meterFill {
              0%, 100% { width: 70%; }
              30% { width: 90%; }
              60% { width: 60%; }
            }
          `,
        }}
      />

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
          <span className="text-sm text-text-secondary">
            Per-Request Pacing
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Per-Request Pacing
        </h1>
        <p className="mt-3 text-text-secondary">
          How v.recipes uses a token-bucket rate limiter to prevent upstream DNS
          congestion while maintaining low latency for individual users.
        </p>
      </header>

      {/* Main Diagram */}
      <section className="animate-fade-up mb-12" style={{ animationDelay: "100ms" }}>
        <Card className="overflow-hidden">
          <div className="mb-6 text-center">
            <Badge variant="accent">Token-Bucket Rate Limiting</Badge>
          </div>

          {/* Visual Flow */}
          <div className="flex flex-col items-center gap-8 py-4">
            {/* Clients */}
            <div>
              <div className="mb-2 text-center text-xs font-medium text-text-muted">
                Incoming DNS Queries
              </div>
              <div className="flex items-end gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ClientIcon key={i} index={i} />
                ))}
              </div>
            </div>

            {/* Arrows down to server */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center px-3">
                  <div className="h-4 w-0.5 bg-success/60" />
                  <svg
                    width="6"
                    height="6"
                    viewBox="0 0 6 6"
                    className="text-success/60"
                    fill="currentColor"
                  >
                    <path d="M3 6L0 0h6z" />
                  </svg>
                </div>
              ))}
            </div>

            {/* v.recipes Server */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-52 items-center justify-center rounded-lg border-2 border-accent/50 bg-accent/5 sm:w-64">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="8"
                        rx="2"
                        ry="2"
                      />
                      <rect
                        x="2"
                        y="14"
                        width="20"
                        height="8"
                        rx="2"
                        ry="2"
                      />
                      <circle cx="6" cy="6" r="1" fill="currentColor" />
                      <circle cx="6" cy="18" r="1" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-accent">
                    v.recipes DNS
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-text-muted">
                Cache + Pacing Layer
              </span>
            </div>

            {/* Pacing Section */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
              {/* Token Bucket */}
              <TokenBucket />

              {/* Flow arrows */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-[10px] font-medium text-success">
                  Paced output
                </div>
                <div className="relative h-1 w-20 overflow-hidden rounded bg-surface-elevated">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 top-0 h-1 w-2 rounded bg-success"
                      style={{
                        animation: `flowDot 1.5s linear ${i * 0.5}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Upstream */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-text-muted/30 bg-surface-elevated text-text-secondary sm:h-24 sm:w-24">
                  <div className="flex flex-col items-center gap-1">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span className="text-[10px] font-bold">Upstream</span>
                  </div>
                </div>
                <span className="text-[10px] text-text-muted">
                  e.g., 1.1.1.1
                </span>
              </div>
            </div>

            {/* Pacing Meter */}
            <div className="w-full max-w-sm">
              <div className="mb-1 flex items-center justify-between text-[10px] text-text-muted">
                <span>Request Rate</span>
                <span>~700 req/s (of 1,000 max)</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-success via-success to-warning"
                  style={{
                    animation: "meterFill 4s ease-in-out infinite",
                  }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-text-muted">
                <span>0</span>
                <span>500</span>
                <span className="text-warning">1,000</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* How it Works Steps */}
      <section className="animate-fade-up mb-12" style={{ animationDelay: "200ms" }}>
        <h2 className="mb-6 text-2xl font-semibold text-text-primary">
          How It Works
        </h2>
        <Card>
          <div className="space-y-6">
            <PacingStep
              number={1}
              title="Token Assignment"
              description="Each incoming DNS query requests a token from a shared bucket. The bucket holds up to 1,000 tokens and refills at a constant rate of 1,000 tokens per second."
              color="bg-accent/20 text-accent"
            />
            <PacingStep
              number={2}
              title="Immediate Forwarding"
              description="If a token is available, the query is forwarded to the upstream resolver immediately with zero added latency. The user experiences no difference from a direct connection."
              color="bg-success/20 text-success"
            />
            <PacingStep
              number={3}
              title="Short Wait Queue"
              description="If the bucket is empty (burst exceeded), the query enters a brief wait queue — typically under 5 milliseconds — until a token becomes available. This micro-delay is imperceptible to users."
              color="bg-warning/20 text-warning"
            />
            <PacingStep
              number={4}
              title="Overflow Protection"
              description="Queries that cannot be served within the wait window receive a cached stale response if available, or a SERVFAIL as a last resort. The upstream provider is never overwhelmed."
              color="bg-error/20 text-error"
            />
          </div>
        </Card>
      </section>

      {/* Why Pacing Matters */}
      <section className="animate-fade-up mb-12" style={{ animationDelay: "300ms" }}>
        <h2 className="mb-6 text-2xl font-semibold text-text-primary">
          Why Pacing Matters
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="warning">Without Pacing</Badge>
            </div>
            <ul className="space-y-2 text-xs leading-relaxed text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-error">&#x2717;</span>
                Upstream provider rate-limits kick in at ~1,500 QPS
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-error">&#x2717;</span>
                Queries start getting dropped silently
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-error">&#x2717;</span>
                All users sharing the resolver experience degraded service
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-error">&#x2717;</span>
                Retry storms amplify the congestion further
              </li>
            </ul>
          </Card>
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="success">With v.recipes Pacing</Badge>
            </div>
            <ul className="space-y-2 text-xs leading-relaxed text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-success">&#x2713;</span>
                Upstream rate stays well below provider limits
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-success">&#x2713;</span>
                No dropped queries under normal operation
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-success">&#x2713;</span>
                Individual user latency unaffected (cache absorbs bulk traffic)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-success">&#x2713;</span>
                Graceful degradation under extreme load via stale cache
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Real-World Example */}
      <section className="animate-fade-up mb-12" style={{ animationDelay: "400ms" }}>
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-text-primary">
            Real-World Example: ECS Optimized Variant
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            Google Public DNS enforces a rate limit of approximately 1,500
            queries per second per source IP. The v.recipes{" "}
            <code className="rounded bg-surface-elevated px-1.5 py-0.5 font-mono text-xs text-accent">
              /dns-ecs
            </code>{" "}
            variant uses Google as its upstream for ECS (EDNS Client Subnet)
            support.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-surface-elevated p-4 text-center">
              <div className="text-2xl font-bold text-text-primary">
                10,000+
              </div>
              <div className="mt-1 text-[10px] text-text-muted">
                Incoming queries/s
              </div>
            </div>
            <div className="rounded-lg bg-success/5 p-4 text-center">
              <div className="text-2xl font-bold text-success">~90%</div>
              <div className="mt-1 text-[10px] text-text-muted">
                Served from cache
              </div>
            </div>
            <div className="rounded-lg bg-accent/5 p-4 text-center">
              <div className="text-2xl font-bold text-accent">&lt;1,000</div>
              <div className="mt-1 text-[10px] text-text-muted">
                Forwarded to Google/s
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-secondary">
            The caching layer absorbs the vast majority of traffic, and pacing
            ensures the remaining upstream queries never exceed Google&apos;s
            rate limit &mdash; even during traffic spikes.
          </p>
        </Card>
      </section>

      {/* Footer */}
      <div className="animate-fade-up flex flex-wrap gap-3 border-t border-border pt-8" style={{ animationDelay: "500ms" }}>
        <Button href="/docs/expl/dns" variant="outline" size="sm">
          &larr; All Illustrations
        </Button>
        <Button href="/docs/expl/dns/cache" variant="outline" size="sm">
          Cache Efficiency
        </Button>
        <Button href="/docs/dns" variant="outline" size="sm">
          Documentation
        </Button>
      </div>
    </div>
  );
}
