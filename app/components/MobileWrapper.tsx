import { type ReactNode } from "react";

interface MobileWrapperProps {
  children: ReactNode;
}

/**
 * Wraps the entire app in a mobile-width container with centered layout.
 * The background outside the mobile area is a neutral gray.
 */
export function MobileWrapper({ children }: MobileWrapperProps) {
  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto min-h-screen bg-white shadow-xl">
        {children}
      </div>
    </div>
  );
}
