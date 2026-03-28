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
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <p className="text-[11px] text-text-muted">
          &copy; {new Date().getFullYear()} v.recipes &middot; design by{" "}
          <a
            href="https://github.com/lostf1sh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent transition-colors hover:text-accent-hover"
          >
            lostf1sh
          </a>
        </p>
        <div className="flex gap-5">
          {footerLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[11px] text-text-muted transition-colors hover:text-text-secondary"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
