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
        hover &&
          "transition-[background-color,border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:bg-surface-elevated hover:shadow-[0_18px_42px_rgba(0,0,0,0.22)] focus-within:-translate-y-0.5 focus-within:border-border-hover focus-within:bg-surface-elevated focus-within:shadow-[0_18px_42px_rgba(0,0,0,0.22)]",
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
