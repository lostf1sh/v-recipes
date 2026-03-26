import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className, hover, style }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-5",
        hover && "transition-colors duration-150 hover:border-border-hover hover:bg-surface-elevated",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-sm font-medium text-text-primary", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("mt-1.5 text-[13px] leading-relaxed text-text-secondary", className)}>
      {children}
    </p>
  );
}
