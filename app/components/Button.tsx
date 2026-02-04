import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  outline?: boolean;
  darkBackground?: boolean;
  compact?: boolean;
  loading?: boolean;
}

export function Button({
  children,
  outline,
  disabled,
  darkBackground,
  compact,
  loading,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded font-semibold transition-colors";
  const sizeStyles = compact ? "px-4 py-2 text-sm" : "px-5 py-3 text-base";
  
  let variantStyles = "";
  if (disabled || loading) {
    variantStyles = "bg-gray-300 text-gray-50 cursor-not-allowed border border-gray-300";
  } else if (outline) {
    variantStyles = darkBackground
      ? "bg-transparent border border-white text-white hover:bg-white/10"
      : "bg-transparent border border-teal-700 text-teal-700 hover:bg-teal-50";
  } else {
    variantStyles = darkBackground
      ? "bg-white border border-white text-teal-700 hover:bg-gray-100"
      : "bg-teal-700 border border-teal-700 text-gray-50 hover:bg-teal-800";
  }

  return (
    <button
      disabled={disabled || loading}
      className={cn(baseStyles, sizeStyles, variantStyles, "my-1", className)}
      {...props}
    >
      {loading ? <span className="animate-spin mr-2">⏳</span> : null}
      {children}
    </button>
  );
}

export default Button;
