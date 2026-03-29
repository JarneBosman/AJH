import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--color-button-bg)] text-[var(--color-button-text)] hover:bg-[var(--color-button-bg-hover)] focus-visible:ring-[var(--color-button-bg)]",
  secondary:
    "bg-[var(--color-button-bg)] text-[var(--color-button-text)] hover:bg-[var(--color-button-bg-hover)] focus-visible:ring-[var(--color-button-bg)]",
  ghost:
    "bg-transparent text-[var(--color-button-bg)] hover:bg-[var(--color-button-bg)] hover:text-[var(--color-button-text)] focus-visible:ring-[var(--color-button-bg)]",
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
              "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold tracking-wide transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 [border-radius:var(--button-radius)]",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
};
