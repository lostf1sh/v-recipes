import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "DNS Illustrations",
  description:
    "Visual explanations of v.recipes DNS concepts — anycast routing, caching layers, AI/ML integration, and per-request pacing.",
};

const illustrations = [
  {
    title: "Anycast vs Non-Anycast Network",
    description:
      "See how anycast routing directs your query to the nearest edge, compared to a traditional single-origin setup.",
    href: "/docs/expl/dns/anycast",
    badge: "Network",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: "Cache Efficiency",
    description:
      "Visualise the multi-layer caching flow from L1 (edge) through L2 (regional) to the upstream resolver.",
    href: "/docs/expl/dns/cache",
    badge: "Performance",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    title: "The Role of AI/ML",
    description:
      "How lightweight ML models at the edge detect malicious domains and optimise cache prefetching.",
    href: "/docs/expl/dns/aiml",
    badge: "AI/ML",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.57-3.25 3.92" />
        <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.57 3.25 3.92" />
        <path d="M12 10v4" />
        <path d="M8 18h8" />
        <path d="M10 22h4" />
        <path d="M12 14h.01" />
      </svg>
    ),
  },
  {
    title: "Per-Request Pacing",
    description:
      "Watch how the token-bucket rate limiter prevents upstream congestion without impacting user latency.",
    href: "/docs/expl/dns/pacing",
    badge: "Rate Control",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v4" />
        <path d="m16.2 7.8 2.9-2.9" />
        <path d="M18 12h4" />
        <path d="m16.2 16.2 2.9 2.9" />
        <path d="M12 18v4" />
        <path d="m4.9 19.1 2.9-2.9" />
        <path d="M2 12h4" />
        <path d="m4.9 4.9 2.9 2.9" />
      </svg>
    ),
  },
];

export default function DNSIllustrationsPage() {
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
            href="/docs/dns"
            className="text-sm text-text-muted transition-colors hover:text-accent"
          >
            Docs
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-sm text-text-secondary">Illustrations</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          DNS Illustrations
        </h1>
        <p className="mt-3 text-text-secondary">
          Visual, animated explanations of the core concepts behind the v.recipes
          DNS architecture.
        </p>
      </header>

      {/* Illustrations Grid */}
      <div className="animate-fade-up grid gap-4 sm:grid-cols-2" style={{ animationDelay: "100ms" }}>
        {illustrations.map((item) => (
          <Link key={item.href} href={item.href} className="group">
            <Card hover className="h-full">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-muted text-accent">
                  {item.icon}
                </div>
                <Badge variant="accent">{item.badge}</Badge>
              </div>
              <CardTitle className="mt-4 transition-colors group-hover:text-accent">
                {item.title}
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
              <div className="mt-4 flex items-center text-xs text-text-muted transition-colors group-hover:text-accent">
                <span>View illustration</span>
                <svg
                  className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="animate-fade-up mt-10 flex flex-wrap gap-3" style={{ animationDelay: "200ms" }}>
        <Button href="/docs/dns" variant="outline" size="sm">
          &larr; Back to Documentation
        </Button>
        <Button href="/dns" variant="outline" size="sm">
          DNS Overview
        </Button>
      </div>
    </div>
  );
}
