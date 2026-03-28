import Link from "next/link";
import { Button } from "@/components/ui/Button";

const projects = [
  {
    title: "DNS",
    description: "Privacy-focused DNS resolution with advanced filtering, pacing, and global anycast coverage.",
    href: "/dns",
    tag: "Core",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    ),
  },
  {
    title: "Bufferbloat Test",
    description: "Measure your network's bufferbloat with real-time latency and throughput analysis under load.",
    href: "/bufferbloat",
    tag: "Tool",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    ),
  },
  {
    title: "vmoji",
    description: "Custom Discord emojis without Nitro. 150+ emojis with lightning-fast slash command responses.",
    href: "/vmoji",
    tag: "App",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
    ),
  },
  {
    title: "Analytics",
    description: "Real-time DNS metrics and performance data. No query logging, privacy-focused dashboard.",
    href: "/analytics",
    tag: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6">
      {/* Hero */}
      <section className="relative flex flex-col items-center py-24 text-center sm:py-32">
        {/* Accent glow */}
        <div className="pointer-events-none absolute top-12 h-48 w-96 rounded-full bg-accent/[0.07] blur-[100px]" />

        <p
          className="animate-fade-up text-[13px] font-medium tracking-wide text-accent"
          style={{ animationDelay: "0ms" }}
        >
          Open experiments
        </p>
        <h1
          className="animate-fade-up mt-4 max-w-2xl text-[clamp(2.25rem,5.5vw,4rem)] font-bold leading-[1.05] tracking-[-0.035em] text-white"
          style={{ animationDelay: "80ms" }}
        >
          Small team.
          <br />
          <span className="bg-gradient-to-r from-text-secondary to-text-muted bg-clip-text text-transparent">
            Big curiosity.
          </span>
        </h1>
        <p
          className="animate-fade-up mt-5 max-w-md text-[15px] leading-[1.6] text-text-secondary"
          style={{ animationDelay: "160ms" }}
        >
          We build focused projects and practical experiments &mdash; webdev, AI,
          APIs, networking, and more.
        </p>
        <div
          className="animate-fade-up mt-8 flex gap-3"
          style={{ animationDelay: "240ms" }}
        >
          <Button href="#projects" size="lg">
            Explore
          </Button>
          <Button href="/aboutus" variant="outline" size="lg">
            About Us
          </Button>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border-hover to-transparent" />

      {/* Projects */}
      <section id="projects" className="py-16">
        <h2
          className="animate-fade-up mb-1 text-sm font-medium text-text-primary"
          style={{ animationDelay: "300ms" }}
        >
          Projects
        </h2>
        <p
          className="animate-fade-up mb-8 text-[13px] text-text-muted"
          style={{ animationDelay: "340ms" }}
        >
          Pick a project to explore.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project, i) => (
            <Link
              key={project.href}
              href={project.href}
              className="animate-fade-up group relative overflow-hidden rounded-lg border border-border bg-surface transition-all duration-200 hover:border-border-hover hover:bg-surface-elevated"
              style={{ animationDelay: `${380 + i * 60}ms` }}
            >
              {/* Subtle accent glow on hover */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-accent/0 transition-all duration-300 group-hover:bg-accent/[0.06] group-hover:blur-2xl" />

              <div className="relative p-5">
                <div className="flex items-center gap-3">
                  <span className="text-accent">{project.icon}</span>
                  <span className="text-sm font-medium text-text-primary transition-colors group-hover:text-white">
                    {project.title}
                  </span>
                  <span className="ml-auto text-[11px] text-text-muted">
                    {project.tag}
                  </span>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
                  {project.description}
                </p>
                <div className="mt-4 flex items-center text-[12px] text-text-muted transition-colors group-hover:text-accent">
                  <span>Explore</span>
                  <svg
                    className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
