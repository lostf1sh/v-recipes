"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/dns", label: "DNS" },
  { href: "/analytics", label: "Analytics" },
  { href: "/bufferbloat", label: "Bufferbloat" },
  { href: "/vmoji", label: "vmoji" },
  { href: "/docs/dns", label: "Docs" },
  { href: "/bcfs", label: "Status" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1200px] items-center gap-6 px-6">
        <Link
          href="/"
          className="shrink-0 text-sm font-medium text-text-primary transition-colors hover:text-white"
        >
          v.recipes
        </Link>
        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1 text-[13px] transition-colors",
                pathname.startsWith(href)
                  ? "text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <MobileMenu pathname={pathname} />
      </div>
    </header>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  return (
    <details className="relative md:hidden" name="mobile-nav">
      <summary className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-text-secondary hover:text-text-primary list-none">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </summary>
      <div className="absolute right-0 top-9 w-44 rounded-lg border border-border bg-surface-elevated p-1.5 shadow-2xl">
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "block rounded-md px-3 py-1.5 text-[13px] transition-colors",
              pathname.startsWith(href)
                ? "text-text-primary"
                : "text-text-muted hover:text-text-secondary hover:bg-surface"
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </details>
  );
}
