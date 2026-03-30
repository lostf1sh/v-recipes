import type { Metadata } from "next";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmojiGrid } from "@/components/features/vmoji/EmojiGrid";

export const metadata: Metadata = {
  title: "vmoji",
  description:
    "Use custom emojis anywhere on Discord without Nitro. Lightning-fast slash command with 150+ emojis across multiple categories.",
};

const steps = [
  {
    number: "1",
    title: "Add vmoji to My Apps",
    description:
      "Click the button below to add vmoji to your Discord account. It takes just one click.",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    number: "2",
    title: "Use /emoji [query]",
    description:
      "Type /emoji followed by the emoji name in any server or DM. Autocomplete helps you find the right one.",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m21 21-4.3-4.3" />
        <circle cx="11" cy="11" r="8" />
      </svg>
    ),
  },
  {
    number: "3",
    title: "Send, Reply & React",
    description:
      "Send emojis as messages, reply to others with them, or use them as reactions on any message.",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 2 11 13" />
        <path d="m22 2-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
  },
];

const commands = [
  {
    name: "/help",
    description:
      "Shows usage instructions, available categories, and helpful links.",
    badge: "Info",
  },
  {
    name: "/emoji [query]",
    description:
      "Search and send any emoji by name. Autocomplete suggestions appear as you type. Add browse:true to open the visual browser.",
    badge: "Core",
  },
  {
    name: "/browse",
    description:
      "Open the visual emoji browser to explore all categories and packs interactively.",
    badge: "Browse",
  },
];

const advancedFeatures = [
  {
    title: "reply_to",
    description:
      "Reply to a specific message with an emoji. Select any message as the target and vmoji sends the emoji as a reply.",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 17 4 12 9 7" />
        <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
      </svg>
    ),
  },
  {
    title: "reaction",
    description:
      "React to a message with an emoji instead of sending it as a new message. Works like native Discord reactions.",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
];


export default function VmojiPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-20">
      {/* Banner */}
      <div className="relative mb-12 animate-fade-up overflow-hidden rounded-lg">
        <Image
          src="/vmoji-banner.jpg"
          alt="vmoji banner"
          width={1600}
          height={480}
          priority
          className="h-auto w-full"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header */}
      <header className="mb-20 animate-fade-up text-center" style={{ animationDelay: "50ms" }}>
        <Badge variant="accent" className="mb-4">
          Discord App
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          vmoji
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[13px] leading-relaxed text-text-muted">
          Use emojis in servers and DMs &mdash; no Nitro required. Lightning-fast
          responses with 150+ emojis across multiple categories.
        </p>
        <div className="mt-8 flex justify-center gap-2">
          <Button
            href="https://discord.com/discovery/applications/1443239934864523356"
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
            </svg>
            Add App
          </Button>
          <Button href="#how-to-use" variant="outline">
            Learn More
          </Button>
        </div>
      </header>

      {/* How to Use */}
      <section id="how-to-use" className="mb-20">
        <div className="mb-6 animate-fade-up" style={{ animationDelay: "50ms" }}>
          <h2 className="text-sm font-medium text-text-primary">How to Use</h2>
          <p className="mt-1 text-[13px] text-text-muted">
            Get started with vmoji in three simple steps.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="animate-fade-up" style={{ animationDelay: `${100 + i * 50}ms` }}>
              <Card hover>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#5865F2]/10 text-[#5865F2]">
                    {step.icon}
                  </div>
                  <span className="text-[11px] font-medium text-text-muted">
                    Step {step.number}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-medium text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-20">
        <div className="mb-6 animate-fade-up" style={{ animationDelay: "250ms" }}>
          <h2 className="text-sm font-medium text-text-primary">How It Works</h2>
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
          <Card className="border-[#5865F2]/15">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#5865F2]/10 text-[#5865F2]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  Fully Legal &amp; Native
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                  vmoji uses Discord&apos;s official{" "}
                  <span className="font-medium text-text-primary">
                    App Emoji feature
                  </span>{" "}
                  &mdash; no hacks, no workarounds, no selfbots. When you use the{" "}
                  <code className="rounded border border-border bg-surface-elevated px-1.5 py-0.5 text-[12px] font-mono text-[#5865F2]">
                    /emoji
                  </code>{" "}
                  command, vmoji sends the emoji through Discord&apos;s
                  application system. This is a first-party feature designed
                  exactly for this purpose, so your account stays safe.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-20">
        <div className="mb-6 animate-fade-up" style={{ animationDelay: "350ms" }}>
          <h2 className="text-sm font-medium text-text-primary">Privacy</h2>
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "400ms" }}>
          <Card>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  Zero Data Collection
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                  vmoji has no databases and performs no logging. We don&apos;t
                  store your messages, track your usage, or collect any personal
                  data. All emojis are stored on Discord&apos;s own servers as
                  application emojis &mdash; vmoji simply acts as a bridge to let
                  you use them.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Badge variant="success">No Database</Badge>
                  <Badge variant="success">No Logging</Badge>
                  <Badge variant="success">No Tracking</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Available Commands */}
      <section className="mb-20">
        <div className="mb-6 animate-fade-up" style={{ animationDelay: "450ms" }}>
          <h2 className="text-sm font-medium text-text-primary">Available Commands</h2>
          <p className="mt-1 text-[13px] text-text-muted">
            Three commands to search, browse, and get help.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {commands.map((cmd, i) => (
            <div key={cmd.name} className="animate-fade-up" style={{ animationDelay: `${500 + i * 50}ms` }}>
              <Card hover className="h-full">
                <div className="flex items-start justify-between">
                  <code className="rounded-md border border-border bg-background px-2.5 py-1 text-[12px] font-mono text-[#5865F2]">
                    {cmd.name}
                  </code>
                  <Badge variant="accent">{cmd.badge}</Badge>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
                  {cmd.description}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Advanced Features */}
      <section className="mb-20">
        <div className="mb-6 animate-fade-up" style={{ animationDelay: "600ms" }}>
          <h2 className="text-sm font-medium text-text-primary">Advanced Features</h2>
          <p className="mt-1 text-[13px] text-text-muted">
            Optional parameters for the{" "}
            <code className="rounded border border-border bg-surface-elevated px-1.5 py-0.5 text-[12px] font-mono text-[#5865F2]">
              /emoji
            </code>{" "}
            command that unlock more functionality.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {advancedFeatures.map((feature, i) => (
            <div key={feature.title} className="animate-fade-up" style={{ animationDelay: `${650 + i * 50}ms` }}>
              <Card hover>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#5865F2]/10 text-[#5865F2]">
                  {feature.icon}
                </div>
                <h3 className="mt-3 text-sm font-medium text-text-primary">
                  <code className="font-mono">{feature.title}</code>{" "}
                  <span className="text-[11px] font-normal text-text-muted">
                    parameter
                  </span>
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Available Emojis */}
      <section className="mb-20">
        <div className="mb-6 animate-fade-up" style={{ animationDelay: "750ms" }}>
          <h2 className="text-sm font-medium text-text-primary">Available Emojis</h2>
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "800ms" }}>
          <Card>
            <EmojiGrid />
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="animate-fade-up rounded-lg border border-[#5865F2]/15 bg-[#5865F2]/5 p-8 text-center" style={{ animationDelay: "850ms" }}>
        <h2 className="text-sm font-medium text-text-primary">Ready to use emojis everywhere?</h2>
        <p className="mx-auto mt-2 max-w-md text-[13px] text-text-muted">
          Add vmoji to your Discord account and start using custom emojis in any
          server or DM &mdash; completely free.
        </p>
        <div className="mt-6">
          <Button
            href="https://discord.com/discovery/applications/1443239934864523356"
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
            </svg>
            Add vmoji to Discord
          </Button>
        </div>
      </section>
    </div>
  );
}
