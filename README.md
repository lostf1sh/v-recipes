# v.recipes

A rebuilt frontend for [v.recipes](https://v.recipes) — privacy-focused DNS tools, network diagnostics, and developer experiments.

Built with Next.js 16, Tailwind CSS v4, and TypeScript. Designed for Cloudflare Pages deployment.

## Features

- **DNS Service** — DoH resolver with 8 variants (unfiltered, security, adblock, ECS, CN optimized, DNS64, accelerator, multiqueue), iOS mobileconfig generation
- **Analytics Dashboard** — Real-time DNS metrics with polling, time-series charts, country/path/IP breakdowns
- **Bufferbloat Test** — Network performance analysis using @cloudflare/speedtest with live latency and throughput charts
- **vmoji** — Discord emoji catalog (244 emojis, 9 categories) with rate limit handling
- **BCFS** — Better Cloudflare Status dashboard with component groups, incidents, and maintenance tracking
- **DNS Docs** — Technical documentation with interactive illustrations (cache efficiency, per-request pacing, anycast, AI/ML pathfinding)

## Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Styling** — [Tailwind CSS v4](https://tailwindcss.com) with custom dark theme
- **Charts** — [Recharts](https://recharts.org) (analytics + bufferbloat)
- **Fonts** — [Geist](https://vercel.com/font) (self-hosted at build time)
- **Language** — TypeScript (strict)
- **Target** — Cloudflare Pages via [@opennextjs/cloudflare](https://opennext.js.org)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx                     # Homepage
  dns/                         # DNS service page + mobileconfig generator
  analytics/                   # Real-time analytics dashboard
  bufferbloat/                 # Speed test with live charts
  vmoji/                       # Discord emoji catalog
  bcfs/                        # Cloudflare status monitor
  docs/dns/                    # DNS documentation
  docs/expl/dns/               # Interactive illustrations
  api/analytics/               # Analytics API proxy
  api/cfstatus/                # Cloudflare Status API proxy
  api/trace/                   # Connection info endpoint
components/
  ui/                          # Card, Button, Badge, LegalPage
  layout/                      # Header, Footer
  features/                    # Feature-specific components
lib/
  types.ts                     # API response types
  format.ts                    # Number/byte formatting (K/M/B/T)
  hooks/useAnalytics.ts        # Analytics data hook with polling
  cn.ts                        # Tailwind class merge utility
```

## API Proxies

All external API calls are proxied through Next.js route handlers to avoid CORS issues and support users in restricted network environments:

| Route | Upstream | Purpose |
|-------|----------|---------|
| `/api/analytics/*` | `v.recipes/analytics/api/*` | DNS analytics data |
| `/api/cfstatus/*` | `cloudflarestatus.com/api/v2/*` | Cloudflare network status |
| `/api/trace` | CF trace + ipinfo.io | Connection info (IP, ISP, location) |

External client-side resources (speedtest library, country flags) are loaded through `b.v.recipes` proxy for accessibility in all regions.

## License

Private project for v.recipes (PT VRECIPES AMANAH SEMESTA).
