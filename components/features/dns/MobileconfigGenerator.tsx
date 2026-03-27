"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateMobileConfig(displayName: string, serverURL: string): string {
  const payloadUUID = generateUUID();
  const configUUID = payloadUUID;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>DNSSettings</key>
            <dict>
                <key>DNSProtocol</key>
                <string>HTTPS</string>
                <key>ServerAddresses</key>
                <array/>
                <key>ServerURL</key>
                <string>${serverURL}</string>
            </dict>
            <key>OnDemandRules</key>
            <array>
                <dict>
                    <key>Action</key>
                    <string>Connect</string>
                    <key>InterfaceTypeMatch</key>
                    <string>WiFi</string>
                </dict>
                <dict>
                    <key>Action</key>
                    <string>Connect</string>
                    <key>InterfaceTypeMatch</key>
                    <string>Cellular</string>
                </dict>
                <dict>
                    <key>Action</key>
                    <string>Disconnect</string>
                </dict>
            </array>
            <key>PayloadDescription</key>
            <string>Configures device to use ${displayName} Encrypted DNS over HTTPS</string>
            <key>PayloadDisplayName</key>
            <string>${displayName} DNS over HTTPS</string>
            <key>PayloadIdentifier</key>
            <string>com.apple.dnsSettings.managed.${payloadUUID}</string>
            <key>PayloadType</key>
            <string>com.apple.dnsSettings.managed</string>
            <key>PayloadUUID</key>
            <string>${payloadUUID}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>ProhibitDisablement</key>
            <false/>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>Encrypted DNS (DoH, DoT)</string>
    <key>PayloadIdentifier</key>
    <string>com.v-recipes.apple-dns.${configUUID}</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${configUUID}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
    <key>PayloadDescription</key>
    <string>Adds different encrypted DNS configurations to Big Sur (or newer) and iOS 14 (or newer) based systems</string>
    <key>PayloadOrganization</key>
    <string>v.recipes</string>
</dict>
</plist>`;
}

function downloadMobileConfig(content: string, filename: string) {
  const blob = new Blob([content], {
    type: "application/x-apple-aspen-config",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- iOS Config Button for each variant row ---

interface IOSConfigButtonProps {
  variantName: string;
  endpoint: string;
  isCustom?: boolean;
  onCustomClick?: () => void;
}

export function IOSConfigButton({
  variantName,
  endpoint,
  isCustom,
  onCustomClick,
}: IOSConfigButtonProps) {
  const handleClick = useCallback(() => {
    if (isCustom && onCustomClick) {
      onCustomClick();
      return;
    }

    const config = generateMobileConfig(
      `v.recipes DNS ${variantName}`,
      endpoint
    );
    const filename = `v-recipes-dns-${variantName.toLowerCase().replace(/\s+/g, "-")}.mobileconfig`;
    downloadMobileConfig(config, filename);
  }, [variantName, endpoint, isCustom, onCustomClick]);

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-text-muted transition-colors hover:border-border-hover hover:text-text-primary cursor-pointer"
      title={`Download iOS config for ${variantName}`}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a9.96 9.96 0 0 1 6.29 2.226" />
        <path d="M18.29 4.226A9.96 9.96 0 0 1 22 12c0 5.523-4.477 10-10 10S2 17.523 2 12a9.96 9.96 0 0 1 3.71-7.774" />
        <path d="M12 2v10" />
        <path d="m8 8 4 4 4-4" />
      </svg>
      iOS
    </button>
  );
}

// --- Custom Config Modal ---

interface CustomConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: "Accelerator" | "Multiqueue";
}

export function CustomConfigModal({
  isOpen,
  onClose,
  variant,
}: CustomConfigModalProps) {
  const [configName, setConfigName] = useState(`v.recipes DNS ${variant}`);
  const [dnsUrls, setDnsUrls] = useState("");
  const [error, setError] = useState("");

  const placeholder =
    variant === "Accelerator"
      ? "Enter DNS URL (without https://):\ndns.google/dns-query\nfreedns.controld.com/p0\ncloudflare-dns.com/dns-query"
      : "Enter DNS URLs (one per line, for multiple providers):\ndns.google/dns-query\nfreedns.controld.com/p0\ncloudflare-dns.com/dns-query";

  const handleGenerate = useCallback(() => {
    const trimmed = dnsUrls.trim();
    if (!trimmed) {
      setError("Please enter at least one DNS URL.");
      return;
    }

    const urls = trimmed
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u);
    if (urls.length === 0) {
      setError("Please enter valid DNS URLs.");
      return;
    }

    let finalUrl: string;
    if (variant === "Accelerator") {
      finalUrl = `https://v.recipes/dns/${urls[0]}`;
    } else {
      finalUrl = `https://v.recipes/mq/${urls.join("/mq/")}`;
    }

    const config = generateMobileConfig(configName || "Custom DNS", finalUrl);
    const filename = `v-recipes-dns-${variant.toLowerCase()}-custom.mobileconfig`;
    downloadMobileConfig(config, filename);

    setDnsUrls("");
    setError("");
    onClose();
  }, [dnsUrls, configName, variant, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "mx-4 w-full max-w-md rounded-lg border border-border bg-surface-elevated p-6 shadow-2xl",
          "animate-fade-up"
        )}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">
            Custom {variant} Config
          </h3>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:text-text-primary cursor-pointer"
          >
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">
              Config Name
            </label>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent"
              placeholder="v.recipes DNS Custom"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">
              DNS URL{variant === "Multiqueue" ? "s" : ""}{" "}
              <span className="text-text-muted">
                (without https://)
              </span>
            </label>
            <textarea
              value={dnsUrls}
              onChange={(e) => {
                setDnsUrls(e.target.value);
                setError("");
              }}
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-[12px] text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent resize-none"
              placeholder={placeholder}
            />
            {error && (
              <p className="mt-1 text-[11px] text-error">{error}</p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="secondary" size="sm" onClick={handleGenerate}>
              Generate & Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
