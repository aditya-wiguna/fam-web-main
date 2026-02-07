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
      : "bg-transparent border border-[#10368c] text-[#10368c] hover:bg-[#EEF3FF]";
  } else {
    variantStyles = darkBackground
      ? "bg-white border border-white text-[#10368c] hover:bg-gray-100"
      : "bg-[#10368c] border border-[#10368c] text-gray-50 hover:bg-[#0C2463]";
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
