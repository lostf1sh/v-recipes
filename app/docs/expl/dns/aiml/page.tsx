import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AIMLAnimation } from "./AIMLAnimation";

export const metadata: Metadata = {
  title: "The Role of AI/ML",
  description:
    "How AI/ML-powered congestion control and A* pathfinding optimize DNS request routing through the accelerator network.",
};

export default function AIMLPage() {
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
          <span className="text-sm text-text-secondary">AI/ML</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            The Role of AI/ML
          </h1>
          <Badge variant="accent">AI/ML</Badge>
        </div>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-text-secondary">
          The accelerator network uses A* pathfinding with congestion-aware
          heuristics to route DNS queries through the optimal path. Congested
          nodes and links are dynamically penalized, causing subsequent requests
          to discover faster routes.
        </p>
      </header>

      {/* Animation */}
      <div
        className="animate-fade-up rounded-lg border border-border bg-surface overflow-hidden"
        style={{ animationDelay: "100ms" }}
      >
        <AIMLAnimation />
      </div>

      {/* Legend */}
      <div
        className="animate-fade-up mt-6 grid gap-4 sm:grid-cols-3"
        style={{ animationDelay: "200ms" }}
      >
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-sm font-medium text-text-primary mb-2">Client</h3>
          <p className="text-[13px] text-text-secondary">
            Sends a DNS query that enters the accelerator mesh at the closest
            node. Shown on the left.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-sm font-medium text-text-primary mb-2">
            Accelerator Mesh
          </h3>
          <p className="text-[13px] text-text-secondary">
            Interconnected relay nodes in the center. A* pathfinding selects the
            lowest-cost route, factoring in link congestion.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-sm font-medium text-text-primary mb-2">
            Upstream DNS
          </h3>
          <p className="text-[13px] text-text-secondary">
            Destination resolvers on the right. Congestion on links turns them
            red; the algorithm avoids hot paths automatically.
          </p>
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
        <Button href="/docs/expl/dns/anycast" variant="outline" size="sm">
          &larr; Anycast
        </Button>
      </div>
    </div>
  );
}
