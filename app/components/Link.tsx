import { type ReactNode, type MouseEventHandler } from "react";
import { Link as RouterLink } from "react-router";
import { cn } from "../utils/cn";

interface LinkProps {
  children: ReactNode;
  to?: string;
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export function Link({ children, to, disabled, className, onClick }: LinkProps) {
  const linkStyles = cn(
    "font-semibold text-[#10368c] hover:text-[#0C2463] cursor-pointer",
    disabled && "text-gray-500 cursor-not-allowed",
    className
  );

  if (to && !disabled) {
    return (
      <RouterLink to={to} className={linkStyles}>
        {children}
      </RouterLink>
    );
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className={linkStyles}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Link;
