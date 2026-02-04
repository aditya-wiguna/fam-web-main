import { type ReactNode, type HTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface MobileContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * MobileContainer wraps content in a max-width container centered on screen
 * to simulate mobile app layout on larger screens.
 */
export function MobileContainer({ children, className, ...props }: MobileContainerProps) {
  return (
    <div className={cn("max-w-lg mx-auto", className)} {...props}>
      {children}
    </div>
  );
}

export default MobileContainer;
