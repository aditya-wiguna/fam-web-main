import { type ReactNode, type HTMLAttributes } from "react";
import { cn } from "../utils/cn";
import colors, { type ColorKey } from "../theme/colors";

interface TextProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  color?: ColorKey;
}

export function H1({ children, color = "black", className, ...props }: TextProps) {
  return (
    <h1
      className={cn("text-2xl font-semibold leading-tight my-3", className)}
      style={{ color: colors[color] }}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({ children, color = "black", className, ...props }: TextProps) {
  return (
    <h2
      className={cn("text-xl font-semibold leading-snug my-3", className)}
      style={{ color: colors[color] }}
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({ children, color = "black", className, ...props }: TextProps) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-snug my-2", className)}
      style={{ color: colors[color] }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function H4({ children, color = "black", className, ...props }: TextProps) {
  return (
    <h4
      className={cn("text-base font-semibold leading-snug my-2", className)}
      style={{ color: colors[color] }}
      {...props}
    >
      {children}
    </h4>
  );
}

export function P({ children, color = "black", className, ...props }: TextProps) {
  return (
    <p
      className={cn("text-sm leading-5 my-1", className)}
      style={{ color: colors[color] }}
      {...props}
    >
      {children}
    </p>
  );
}

export function Small({ children, color = "black", className, ...props }: TextProps) {
  return (
    <span
      className={cn("text-xs leading-4 my-1", className)}
      style={{ color: colors[color] }}
      {...props}
    >
      {children}
    </span>
  );
}

export function Lead({ children, color = "black", className, ...props }: TextProps) {
  return (
    <p
      className={cn("text-xl leading-snug my-2", className)}
      style={{ color: colors[color] }}
      {...props}
    >
      {children}
    </p>
  );
}

export function Hero({ children, color = "black", className, ...props }: TextProps) {
  return (
    <span
      className={cn("text-4xl font-semibold leading-tight my-5", className)}
      style={{ color: colors[color] }}
      {...props}
    >
      {children}
    </span>
  );
}

export function Tiny({ children, color = "black", className, ...props }: TextProps) {
  return (
    <span
      className={cn("text-xs leading-4 my-1", className)}
      style={{ color: colors[color] }}
      {...props}
    >
      {children}
    </span>
  );
}
