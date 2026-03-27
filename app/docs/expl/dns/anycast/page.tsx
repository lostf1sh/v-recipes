import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnycastAnimation } from "./AnycastAnimation";

export const metadata: Metadata = {
  title: "Anycast vs Non-Anycast Network",
  description:
    "Visual comparison of anycast and non-anycast DNS routing showing how requests reach the nearest server.",
};

export default function AnycastPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Breadcrumb */}
      <header className="animate-fade-up mb-10">
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
          <span className="text-sm text-text-secondary">Anycast</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Anycast vs Non-Anycast Network
          </h1>
          <Badge variant="accent">Network</Badge>
        </div>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-text-secondary">
          Non-anycast DNS routes all queries to a single server regardless of
          distance, causing high latency. Anycast DNS advertises the same IP from
          multiple locations, so each client is automatically served by the
          nearest edge.
        </p>
      </header>

      {/* Animation */}
      <div
        className="animate-fade-up rounded-lg border border-border bg-surface overflow-hidden"
        style={{ animationDelay: "100ms" }}
      >
        <AnycastAnimation />
      </div>

      {/* Legend */}
      <div
        className="animate-fade-up mt-6 grid gap-4 sm:grid-cols-2"
        style={{ animationDelay: "200ms" }}
      >
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-sm font-medium text-text-primary mb-2">
            Non-Anycast (Left)
          </h3>
          <ul className="space-y-1 text-[13px] text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#f87171]" />
              Single server handles all traffic
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#f87171]" />
              Distant clients experience high latency
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#f87171]" />
              Single point of failure
            </li>
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-sm font-medium text-text-primary mb-2">
            Anycast (Right)
          </h3>
          <ul className="space-y-1 text-[13px] text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#34d399]" />
              Multiple servers share the same IP
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#34d399]" />
              Clients are routed to the nearest server
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#34d399]" />
              Built-in redundancy and load distribution
            </li>
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <div
        className="animate-fade-up mt-10 flex flex-wrap gap-3"
        style={{ animationDelay: "300ms" }}
      >
        <Button href="/docs/expl/dns" variant="outline" size="sm">
          &larr; All Illustrations
        </Button>
        <Button href="/docs/expl/dns/aiml" variant="outline" size="sm">
          AI/ML Role &rarr;
        </Button>
      </div>
    </div>
  );
}
