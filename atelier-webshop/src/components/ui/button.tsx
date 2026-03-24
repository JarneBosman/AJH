import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--color-wood-dark)] text-white hover:bg-[var(--color-wood)] focus-visible:ring-[var(--color-wood-dark)]",
  secondary:
    "bg-[var(--color-neutral-100)] text-[var(--color-ink)] hover:bg-[var(--color-neutral-200)] focus-visible:ring-[var(--color-neutral-300)]",
  ghost:
    "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-neutral-100)] focus-visible:ring-[var(--color-neutral-300)]",
};

export const Button = ({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold tracking-wide transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
};
