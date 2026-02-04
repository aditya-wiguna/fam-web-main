import { type ReactNode, type HTMLAttributes } from "react";
import { cn } from "../utils/cn";
import colors, { type ColorKey } from "../theme/colors";

interface HighlightHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  color?: ColorKey;
  borderBottomColor?: ColorKey | "";
}

export function HighlightHeader({ 
  children, 
  color = "teal800", 
  borderBottomColor = "",
  className, 
  ...props 
}: HighlightHeaderProps) {
  const bgColor = colors[color] || colors.teal800;
  const borderColor = borderBottomColor ? colors[borderBottomColor] : "transparent";
  
  return (
    <div
      className={cn("rounded-b-[40px] pb-5 px-5", className)}
      style={{ 
        backgroundColor: bgColor,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        borderLeftWidth: borderBottomColor ? 0.5 : 0,
        borderRightWidth: borderBottomColor ? 0.5 : 0,
        borderBottomWidth: borderBottomColor ? 0.5 : 0,
        borderColor: borderColor,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

interface HighlightBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  color?: ColorKey;
  borderTopColor?: ColorKey | "";
}

export function HighlightBody({ 
  children, 
  color = "grey10", 
  borderTopColor = "",
  className, 
  ...props 
}: HighlightBodyProps) {
  const bgColor = colors[color] || colors.grey10;
  const borderColor = borderTopColor ? colors[borderTopColor] : "transparent";
  
  return (
    <div
      className={cn("rounded-t-[40px] pt-5 -mt-5 px-5", className)}
      style={{ 
        backgroundColor: bgColor,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        borderLeftWidth: borderTopColor ? 0.5 : 0,
        borderRightWidth: borderTopColor ? 0.5 : 0,
        borderTopWidth: borderTopColor ? 0.5 : 0,
        borderColor: borderColor,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
