import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DNSVariantsSection } from "./DNSVariantsSection";

export const metadata: Metadata = {
  title: "DNS",
  description: "Fast, reliable, and privacy-focused DNS resolution with advanced filtering and global coverage.",
};

const features = [
  {
    title: "Privacy First",
    description: "No query logging. No data selling. Your DNS queries stay private.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Global Anycast",
    description: "Requests are routed to the nearest server for the lowest latency.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: "Per-Request Pacing",
    description: "Intelligent rate control that prevents upstream congestion without impacting your speed.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" />
        <path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" />
        <path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" />
      </svg>
    ),
  },
  {
    title: "HTTP/3 & DoH",
    description: "DNS-over-HTTPS with HTTP/3 support for faster, encrypted resolution.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
];

export default function DNSPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-20">
      {/* Header */}
      <header className="mb-20 animate-fade-up text-center">
        <Badge variant="accent" className="mb-4">DNS Service</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Uncongested DNS Resolution
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[13px] leading-relaxed text-text-muted">
          Reliable, fast, and secure DNS service with privacy-focused resolution
          and global anycast coverage.
        </p>
      </header>

      {/* Features Grid */}
      <section className="mb-20">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div key={feature.title} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <Card hover className="h-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-muted text-accent">
                  {feature.icon}
                </div>
                <h3 className="mt-3 text-sm font-medium text-text-primary">{feature.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* DNS Variants (client component for mobileconfig interaction) */}
      <DNSVariantsSection />

      {/* Also Available */}
      <section className="mb-20">
        <div className="mb-6 animate-fade-up" style={{ animationDelay: "550ms" }}>
          <h2 className="text-sm font-medium text-text-primary">Also Available On</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="animate-fade-up" style={{ animationDelay: "600ms" }}>
            <a href="https://discord.com/discovery/applications/1443239934864523356" target="_blank" rel="noopener noreferrer">
              <Card hover className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5865F2]/10 text-[#5865F2]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-text-primary">vDNS on Discord</h3>
                  <p className="text-[13px] text-text-secondary">Use <code className="font-mono text-accent">/dns</code> command in any server</p>
                </div>
              </Card>
            </a>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "650ms" }}>
            <a href="https://t.me/vaborrecipesbot" target="_blank" rel="noopener noreferrer">
              <Card hover className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0088cc]/10 text-[#0088cc]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-text-primary">vDNS on Telegram</h3>
                  <p className="text-[13px] text-text-secondary">Use <code className="font-mono text-accent">/help</code> to get started</p>
                </div>
              </Card>
            </a>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="flex flex-wrap justify-center gap-2 animate-fade-up" style={{ animationDelay: "700ms" }}>
        <Button href="/docs/dns" variant="outline" size="sm">
          Technical Documentation
        </Button>
        <Button href="/docs/expl/dns" variant="outline" size="sm">
          Illustrations
        </Button>
        <Button href="/analytics" variant="outline" size="sm">
          Live Analytics
        </Button>
      </section>
    </div>
  );
}
