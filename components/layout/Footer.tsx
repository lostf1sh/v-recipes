import Link from "next/link";

const footerLinks = [
  { href: "/aboutus", label: "About" },
  { href: "/terms-of-service", label: "Terms" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/acceptable-use-policy", label: "AUP" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] leading-relaxed text-text-muted">
          &copy; {new Date().getFullYear()} v.recipes &middot; Designed by{" "}
          <a
            href="https://github.com/lostf1sh"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            lostf1sh
          </a>
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {footerLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-sm text-[11px] text-text-muted transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
