import { type ReactNode, type HTMLAttributes, type MouseEventHandler } from "react";
import { cn } from "../utils/cn";
import colors from "../theme/colors";

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  backgroundColor?: string;
  borderColor?: string;
  shadowColor?: string;
}

export function Card({ 
  children, 
  onClick, 
  className,
  backgroundColor = colors.white,
  borderColor = "transparent",
  shadowColor = colors.grey200,
  ...props 
}: CardProps) {
  const baseStyle = {
    backgroundColor,
    borderColor,
    boxShadow: `1px 2px 2px ${shadowColor}`,
  };

  const baseClassName = cn(
    "rounded-2xl p-4 mt-0 mb-4 border",
    onClick && "cursor-pointer w-full text-left",
    className
  );

  if (onClick) {
    return (
      <button 
        type="button" 
        onClick={onClick} 
        className={baseClassName}
        style={baseStyle}
      >
        {children}
      </button>
    );
  }
  
  return (
    <div className={baseClassName} style={baseStyle} {...props}>
      {children}
    </div>
  );
}

export default Card;
