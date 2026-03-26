import type { Metadata } from "next";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the team behind v.recipes — engineers and operators based in Jakarta, Indonesia.",
};

export default function AboutUsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-20">
      <header className="mb-16 animate-fade-up">
        <p className="text-sm font-medium text-accent">About</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
          About Us
        </h1>
        <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-text-muted">
          We build small, useful projects &mdash; experiments and developer tools
          driven by curiosity and craftsmanship.
        </p>
      </header>

      <div className="space-y-3">
        <div className="animate-fade-up" style={{ animationDelay: "50ms" }}>
          <Card>
            <CardTitle>Our Story</CardTitle>
            <CardDescription>
              We started as a group of engineers solving real web problems. DNS was our
              first focus &mdash; building a fast, private, and reliable resolver that
              we&apos;d actually want to use ourselves. From there, we kept going: small
              tools, practical experiments, each one meant to be genuinely useful.
            </CardDescription>
            <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
              We move fast, iterate often, and prefer small, useful releases over big,
              flashy launches.
            </p>
          </Card>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <Card>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>
              We build small, useful tools that solve real problems &mdash; fast,
              reliable, and privacy-minded.
            </CardDescription>
            <ul className="mt-4 space-y-2.5">
              {[
                ["Dependability", "Services you can trust, every day"],
                ["Speed", "Measured, practical performance wins"],
                ["Privacy & Security", "Built-in, not bolted on"],
                ["Practical Innovation", "Experiments that become tools"],
                ["Accessibility", "Useful for as many people as possible"],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-2 text-[13px]">
                  <span className="mt-0.5 text-accent">&#8226;</span>
                  <span className="text-text-secondary">
                    <span className="font-medium text-text-primary">{title}</span> &mdash; {desc}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
          <Card>
            <CardTitle>Our Values</CardTitle>
            <ul className="mt-4 space-y-2.5">
              {[
                ["Be helpful", "Always ship value to users"],
                ["Be honest", "Clear, accurate communication"],
                ["Ship quality", "Small, well-crafted releases"],
                ["Work together", "Open feedback and collaboration"],
                ["Keep learning", "Iterate fast and improve"],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-2 text-[13px]">
                  <span className="mt-0.5 text-accent">&#8226;</span>
                  <span className="text-text-secondary">
                    <span className="font-medium text-text-primary">{title}</span> &mdash; {desc}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Card>
            <CardTitle>Who We Are</CardTitle>
            <CardDescription>
              We&apos;re a small team of engineers and operators based in Jakarta,
              Indonesia. Our work spans networking, backend systems, frontend UI, and
              machine learning. We keep the feedback loop short and prioritize real user
              impact over anything else.
            </CardDescription>
          </Card>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "250ms" }}>
          <Card>
            <CardTitle>Registered Business</CardTitle>
            <dl className="mt-4 space-y-3">
              {[
                ["Company", "PT VRECIPES AMANAH SEMESTA"],
                ["NIB", "0502260145755"],
                ["NPWP", "1000000008166495"],
                ["Certificate", "AHU-007995.AH.01.30. Tahun 2026"],
                [
                  "Office",
                  "Jl. Jagakarsa 1, Gg. Nusa Indah 2 No. 21, Jagakarsa, Jakarta Selatan, DKI Jakarta 12620",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                  <dt className="w-28 shrink-0 text-[13px] font-medium text-text-primary">{label}</dt>
                  <dd className="text-[13px] text-text-secondary">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "300ms" }}>
          <Card>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>
              Questions, feedback, or ideas? Send a note &mdash; we read everything.
            </CardDescription>
            <a
              href="mailto:ask@v.recipes"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent transition-colors hover:text-accent-hover"
            >
              ask@v.recipes
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
