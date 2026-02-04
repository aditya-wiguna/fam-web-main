import { type ReactNode } from "react";
import { cn } from "../utils/cn";

interface AlertProps {
  children: ReactNode;
  type?: "error" | "warning" | "success" | "info";
  className?: string;
}

export function Alert({ children, type = "error", className }: AlertProps) {
  const typeStyles = {
    error: "bg-red-50 text-red-600 border-red-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    success: "bg-green-50 text-green-600 border-green-200",
    info: "bg-blue-50 text-blue-600 border-blue-200",
  };

  return (
    <div
      className={cn(
        "rounded-md p-3 my-2 border text-sm",
        typeStyles[type],
        className
      )}
    >
      {children}
    </div>
  );
}

export default Alert;
