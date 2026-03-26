import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "info";

const variants: Record<BadgeVariant, string> = {
  default: "border-border text-text-muted",
  accent: "border-accent/20 text-accent bg-accent-muted",
  success: "border-success/20 text-success bg-success/5",
  warning: "border-warning/20 text-warning bg-warning/5",
  info: "border-info/20 text-info bg-info/5",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
