import { cn } from "@/lib/cn";
import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
} & (
  | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "className">)
  | ({ href?: never } & React.ButtonHTMLAttributes<HTMLButtonElement>)
);

const variants = {
  primary: "bg-white text-black hover:bg-white/90",
  secondary: "bg-accent text-white hover:bg-accent-hover",
  outline: "border border-border text-text-secondary hover:border-border-hover hover:text-text-primary",
  ghost: "text-text-secondary hover:text-text-primary",
};

const sizes = {
  sm: "h-7 px-3 text-[12px]",
  md: "h-8 px-4 text-[13px]",
  lg: "h-9 px-5 text-sm",
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 cursor-pointer",
    variants[variant],
    sizes[size],
    className
  );

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
