import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "DNS Documentation",
  description:
    "Technical documentation for v.recipes DNS — architecture, privacy, caching, pacing, and variant reference.",
};

const variants = [
  {
    name: "Unfiltered",
    endpoint: "https://v.recipes/dns-query",
    upstream: "Cloudflare 1.1.1.1",
    description:
      "Default resolver with per-request pacing. No content filtering applied.",
    badge: "Default" as const,
  },
  {
    name: "Security",
    endpoint: "https://v.recipes/dns-security",
    upstream: "Cloudflare 1.1.1.2",
    description:
      "Malware and phishing domains are blocked at the resolver level.",
  },
  {
    name: "Adblock",
    endpoint: "https://v.recipes/dns-adblock",
    upstream: "Cloudflare 1.1.1.2 + custom lists",
    description:
      "Ad-blocking DNS ideal for restricted environments where browser extensions are unavailable.",
  },
  {
    name: "ECS Optimized",
    endpoint: "https://v.recipes/dns-ecs",
    upstream: "dns.google",
    description:
      "Upstream to dns.google with ECS support for CDN-optimized routing. Bypasses the default 1500 QPS cap imposed by Google.",
    badge: "Performance" as const,
  },
  {
    name: "CN Optimized",
    endpoint: "https://v.recipes/dns-cn",
    upstream: "DOH.SB (Hong Kong)",
    description:
      "Recommended for users in mainland China. Routes through a Hong Kong upstream for better reachability.",
  },
  {
    name: "DNS64 Unfiltered",
    endpoint: "https://v.recipes/dns64",
    upstream: "Cloudflare 1.1.1.1",
    description:
      "Synthesises AAAA records for IPv4-only domains, enabling connectivity on IPv6-only networks.",
  },
  {
    name: "Accelerator",
    endpoint: "https://v.recipes/dns/(provider)",
    upstream: "User-specified DoH provider",
    description:
      "Bring-your-own-upstream mode. Replace (provider) with any DoH endpoint URL to add pacing and caching in front of it.",
  },
  {
    name: "Multiqueue",
    endpoint: "https://v.recipes/mq/(providers)",
    upstream: "Multiple DoH providers",
    description:
      "Fans the query out to multiple upstream providers simultaneously and returns the fastest response.",
    badge: "Advanced" as const,
  },
];

export default function DNSDocsPage() {
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
          <span className="text-sm text-text-secondary">Documentation</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          DNS Documentation
        </h1>
        <p className="mt-3 text-text-secondary">
          Architecture, privacy model, caching layers, pacing mechanics, and a
          full variant reference for the v.recipes DNS service.
        </p>
      </header>

      {/* Domain Migration Notice */}
      <section className="animate-fade-up mb-10" style={{ animationDelay: "100ms" }}>
        <Card className="border-warning/30 bg-warning/5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">
                Domain Migration: 0ms.dev &rarr; v.recipes
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                We have migrated from <code className="text-accent">0ms.dev</code>{" "}
                to <code className="text-accent">v.recipes</code>. All existing
                endpoints on 0ms.dev continue to work and redirect automatically,
                but we recommend updating your configuration to use the new domain
                at your earliest convenience.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Prose content */}
      <div className="animate-fade-up space-y-10" style={{ animationDelay: "200ms" }}>
        {/* How We Got Here */}
        <section>
          <h2 className="mb-3 text-2xl font-semibold text-text-primary">
            How We Got Here
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              v.recipes DNS started as an internal experiment &mdash; a
              DNS-over-HTTPS proxy built on Cloudflare Workers to see how far we
              could push edge-computed DNS. The project grew out of frustration
              with traditional resolvers that either logged queries, lacked
              modern transport support, or buckled under bursty traffic.
            </p>
            <p>
              We released it publicly in 2024 under the domain{" "}
              <code className="text-accent">0ms.dev</code>, and later
              transitioned to <code className="text-accent">v.recipes</code> as
              the service expanded. What began as a single unfiltered endpoint
              now spans eight variants, each tuned for a different use case.
            </p>
          </div>
        </section>

        {/* Why Consider Another DNS Resolver? */}
        <section>
          <h2 className="mb-3 text-2xl font-semibold text-text-primary">
            Why Consider Another DNS Resolver?
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              Most users rely on whatever DNS resolver their ISP assigns by
              default. These resolvers are often unencrypted, may log queries,
              and can inject or redirect results. Even popular public resolvers
              like Google DNS or Cloudflare 1.1.1.1 have trade-offs &mdash; rate
              limits, lack of ECS support in certain configurations, or
              suboptimal routing for some regions.
            </p>
            <p>
              v.recipes addresses these gaps with a layered caching
              architecture, per-request pacing to prevent upstream congestion,
              and a strict no-logging policy. If you care about DNS privacy,
              performance under load, or need a resolver that works well from
              regions with restrictive networks, v.recipes is designed for you.
            </p>
          </div>
        </section>

        {/* Logging and Privacy */}
        <section>
          <h2 className="mb-3 text-2xl font-semibold text-text-primary">
            Logging and Privacy
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              v.recipes does not log DNS queries. We do not record the domains
              you resolve, the IP addresses you connect from, or any metadata
              that could be used to reconstruct your browsing history.
            </p>
            <p>
              Aggregate, anonymised metrics (total query counts, cache hit
              ratios, latency percentiles) are collected for operational
              monitoring. These metrics contain no personally identifiable
              information and cannot be tied back to individual users or
              sessions.
            </p>
            <p>
              Our full privacy practices are described in the{" "}
              <Link
                href="/privacy-policy"
                className="text-accent hover:text-accent-hover"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Anycast Network */}
        <section>
          <h2 className="mb-3 text-2xl font-semibold text-text-primary">
            Anycast Network
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              v.recipes is deployed on Cloudflare&apos;s global anycast network,
              spanning 300+ data centres across 100+ countries. When you send a
              DNS query to v.recipes, it is routed by BGP to the nearest
              Cloudflare PoP &mdash; typically within a few milliseconds of your
              location.
            </p>
            <p>
              This means there is no single point of failure and no need to
              &quot;choose a server.&quot; The network handles failover and
              load-balancing automatically. Whether you are in Jakarta, Berlin,
              or Sao Paulo, your query hits a nearby edge.
            </p>
            <p>
              <Link
                href="/docs/expl/dns/anycast"
                className="text-accent hover:text-accent-hover"
              >
                See the Anycast vs Non-Anycast illustration &rarr;
              </Link>
            </p>
          </div>
        </section>

        {/* Cache Efficiency */}
        <section>
          <h2 className="mb-3 text-2xl font-semibold text-text-primary">
            Cache Efficiency
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              v.recipes uses a multi-layer caching strategy to minimise upstream
              queries and deliver the fastest possible response times.
            </p>
            <ul className="ml-4 list-disc space-y-2 marker:text-accent">
              <li>
                <strong className="text-text-primary">L1 Cache (Edge)</strong>{" "}
                &mdash; Each Cloudflare Worker maintains an in-memory cache
                scoped to the individual isolate. Hot queries are answered
                directly from memory with sub-millisecond overhead.
              </li>
              <li>
                <strong className="text-text-primary">
                  L2 Cache (Regional)
                </strong>{" "}
                &mdash; Backed by Cloudflare&apos;s Cache API, the L2 layer
                shares cached responses across all Workers in the same data
                centre. This dramatically reduces upstream lookups for popular
                domains.
              </li>
              <li>
                <strong className="text-text-primary">Upstream DNS</strong>{" "}
                &mdash; On a cache miss at both layers, the query is forwarded
                to the configured upstream resolver (e.g., Cloudflare 1.1.1.1,
                Google DNS). The response is then stored in both L1 and L2 for
                subsequent requests.
              </li>
            </ul>
            <p>
              This architecture achieves cache hit rates above 90% for most
              deployments, meaning the vast majority of queries never leave the
              edge.
            </p>
            <p>
              <Link
                href="/docs/expl/dns/cache"
                className="text-accent hover:text-accent-hover"
              >
                See the Cache Efficiency illustration &rarr;
              </Link>
            </p>
          </div>
        </section>

        {/* The Role of AI/ML */}
        <section>
          <h2 className="mb-3 text-2xl font-semibold text-text-primary">
            The Role of AI/ML
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              v.recipes integrates lightweight machine-learning models at the
              edge to improve DNS outcomes without adding latency. Current
              applications include:
            </p>
            <ul className="ml-4 list-disc space-y-2 marker:text-accent">
              <li>
                <strong className="text-text-primary">
                  Malicious Domain Detection
                </strong>{" "}
                &mdash; A compact classifier trained on known-bad domain
                patterns identifies suspicious queries in real time. This
                supplements upstream blocklists with heuristic detection of
                newly-registered or algorithmically-generated domains (DGAs).
              </li>
              <li>
                <strong className="text-text-primary">
                  Predictive Prefetching
                </strong>{" "}
                &mdash; By analysing aggregate query patterns, the system can
                proactively refresh cache entries for domains likely to be
                requested soon, reducing cold-cache latency for popular sites.
              </li>
              <li>
                <strong className="text-text-primary">
                  Adaptive Pacing Tuning
                </strong>{" "}
                &mdash; The per-request pacing parameters are periodically
                adjusted based on observed upstream latency and error rates,
                ensuring optimal throughput without triggering provider rate
                limits.
              </li>
            </ul>
            <p>
              All inference runs within the Cloudflare Worker &mdash; no data
              leaves the edge for ML processing.
            </p>
            <p>
              <Link
                href="/docs/expl/dns/aiml"
                className="text-accent hover:text-accent-hover"
              >
                See the AI/ML illustration &rarr;
              </Link>
            </p>
          </div>
        </section>

        {/* Per-Request Pacing */}
        <section>
          <h2 className="mb-3 text-2xl font-semibold text-text-primary">
            Per-Request Pacing
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              DNS providers like Google Public DNS impose rate limits &mdash;
              typically around 1,500 queries per second per source IP. When
              multiple users share the same proxy or resolver, it is easy to
              exceed these limits, resulting in dropped queries and degraded
              reliability for everyone.
            </p>
            <p>
              v.recipes solves this with{" "}
              <strong className="text-text-primary">per-request pacing</strong>:
              a token-bucket rate limiter applied at the individual request level
              before any query is forwarded upstream. The default ceiling is
              1,000 requests per second per upstream provider.
            </p>
            <Card className="my-4">
              <h3 className="mb-2 text-sm font-semibold text-text-primary">
                How it works
              </h3>
              <ol className="ml-4 list-decimal space-y-2 text-sm text-text-secondary">
                <li>
                  Each incoming DNS query is assigned a pacing token from a
                  shared bucket (capacity: 1,000 tokens, refill rate: 1,000/s).
                </li>
                <li>
                  If a token is available, the query proceeds immediately to
                  the upstream resolver with zero added latency.
                </li>
                <li>
                  If the bucket is empty, the query enters a short wait queue
                  (typically &lt;5 ms) until a token becomes available.
                </li>
                <li>
                  Queries that cannot be served within the wait window receive
                  a cached stale response (if available) or a SERVFAIL, ensuring
                  the upstream provider is never overwhelmed.
                </li>
              </ol>
            </Card>
            <p>
              The result is a consistent, predictable query rate that stays well
              within upstream provider limits &mdash; even under heavy load.
              Individual users experience minimal or no added latency because the
              vast majority of queries are served from cache before pacing is
              even relevant.
            </p>
            <p>
              The ECS Optimized variant is a practical example: Google Public DNS
              enforces a 1,500 QPS cap, but v.recipes&apos; caching layer absorbs
              the bulk of traffic, and pacing ensures the remaining upstream
              queries never trip the limit.
            </p>
            <p>
              <Link
                href="/docs/expl/dns/pacing"
                className="text-accent hover:text-accent-hover"
              >
                See the Per-Request Pacing illustration &rarr;
              </Link>
            </p>
          </div>
        </section>

        {/* Suitable for Networks of All Sizes */}
        <section>
          <h2 className="mb-3 text-2xl font-semibold text-text-primary">
            Suitable for Networks of All Sizes
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              Whether you are configuring DNS for a single device, a home
              network, a small business, or a large enterprise deployment,
              v.recipes scales automatically. The anycast network, multi-layer
              cache, and per-request pacing work together to deliver consistent
              performance regardless of query volume.
            </p>
            <ul className="ml-4 list-disc space-y-2 marker:text-accent">
              <li>
                <strong className="text-text-primary">Single device</strong>{" "}
                &mdash; Point your system DNS to v.recipes via DoH for
                encrypted, private resolution.
              </li>
              <li>
                <strong className="text-text-primary">Home network</strong>{" "}
                &mdash; Configure your router to use v.recipes as the upstream
                resolver for all connected devices.
              </li>
              <li>
                <strong className="text-text-primary">
                  Enterprise / ISP
                </strong>{" "}
                &mdash; Use the Accelerator or Multiqueue variants for
                high-throughput deployments with custom upstream selection.
              </li>
            </ul>
          </div>
        </section>

        {/* Which Variant Should You Use? */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold text-text-primary">
            Which Variant Should You Use?
          </h2>
          <p className="mb-6 text-sm text-text-secondary">
            All variants use DNS-over-HTTPS (DoH) and share the same caching and
            pacing infrastructure. Choose based on your filtering needs, upstream
            preference, or network environment.
          </p>
          <div className="space-y-3">
            {variants.map((v) => (
              <Card key={v.name}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-primary">
                        {v.name}
                      </h3>
                      {v.badge && (
                        <Badge variant="accent">{v.badge}</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      {v.description}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      Upstream: {v.upstream}
                    </p>
                  </div>
                  <code className="shrink-0 rounded-md bg-background px-3 py-1.5 font-mono text-xs text-text-muted">
                    {v.endpoint}
                  </code>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer links */}
        <section className="animate-fade-up flex flex-wrap gap-3 border-t border-border pt-8" style={{ animationDelay: "300ms" }}>
          <Button href="/dns" variant="outline" size="sm">
            &larr; Back to DNS
          </Button>
          <Button href="/docs/expl/dns" variant="outline" size="sm">
            Illustrations
          </Button>
          <Button href="/analytics" variant="outline" size="sm">
            Live Analytics
          </Button>
        </section>
      </div>
    </div>
  );
}
