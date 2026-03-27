"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  IOSConfigButton,
  CustomConfigModal,
} from "@/components/features/dns/MobileconfigGenerator";

const variants = [
  {
    name: "Unfiltered",
    endpoint: "https://v.recipes/dns-query",
    description: "Upstream to Cloudflare 1.1.1.1 with per-request pacing",
    badge: "Default" as const,
    isCustom: false,
  },
  {
    name: "Security",
    endpoint: "https://v.recipes/dns-security",
    description: "Upstream to Cloudflare 1.1.1.2 with malware filtering",
    isCustom: false,
  },
  {
    name: "Adblock",
    endpoint: "https://v.recipes/dns-adblock",
    description: "Ad-blocking DNS for restricted environments",
    isCustom: false,
  },
  {
    name: "ECS Optimized",
    endpoint: "https://v.recipes/dns-ecs",
    description: "Google Public DNS with ECS support, no 1500 QPS limit",
    badge: "Performance" as const,
    isCustom: false,
  },
  {
    name: "CN Optimized",
    endpoint: "https://v.recipes/dns-cn",
    description: "Recommended for China users via DOH.SB Hong Kong",
    isCustom: false,
  },
  {
    name: "DNS64 Unfiltered",
    endpoint: "https://v.recipes/dns64",
    description: "IPv6-only network support",
    isCustom: false,
  },
  {
    name: "Accelerator",
    endpoint: "https://v.recipes/dns/(provider)",
    description: "Fast DNS with any DoH provider as upstream",
    isCustom: true,
    customVariant: "Accelerator" as const,
  },
  {
    name: "Multiqueue",
    endpoint: "https://v.recipes/mq/(providers)",
    description: "Query multiple upstream providers simultaneously",
    badge: "Advanced" as const,
    isCustom: true,
    customVariant: "Multiqueue" as const,
  },
];

export function DNSVariantsSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"Accelerator" | "Multiqueue">("Accelerator");

  return (
    <>
      <section className="mb-20">
        <div className="mb-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-sm font-medium text-text-primary">DNS Variants</h2>
          <p className="mt-1 text-[13px] text-text-muted">
            Choose a variant that fits your needs. All variants use DNS-over-HTTPS (DoH).
          </p>
        </div>
        <div className="space-y-2">
          {variants.map((variant, i) => (
            <div key={variant.name} className="animate-fade-up" style={{ animationDelay: `${250 + i * 40}ms` }}>
              <Card hover className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-text-primary">{variant.name}</h3>
                    {variant.badge && <Badge variant="accent">{variant.badge}</Badge>}
                  </div>
                  <p className="mt-0.5 text-[13px] text-text-secondary">{variant.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <IOSConfigButton
                    variantName={variant.name}
                    endpoint={variant.endpoint}
                    isCustom={variant.isCustom}
                    onCustomClick={
                      variant.isCustom && variant.customVariant
                        ? () => {
                            setModalVariant(variant.customVariant!);
                            setModalOpen(true);
                          }
                        : undefined
                    }
                  />
                  <code className="rounded-md border border-border bg-background px-3 py-1.5 text-[12px] text-text-muted font-mono">
                    {variant.endpoint}
                  </code>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      <CustomConfigModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        variant={modalVariant}
      />
    </>
  );
}
