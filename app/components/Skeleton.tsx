import { type ReactNode } from "react";
import { cn } from "../utils/cn";

interface SkeletonProps {
  loading: boolean;
  children: ReactNode;
  className?: string;
}

export function Skeleton({ loading, children, className }: SkeletonProps) {
  if (!loading) return <>{children}</>;

  return (
    <div className={cn("animate-pulse", className)}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-32 bg-gray-200 rounded mb-4" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
    </div>
  );
}

export default Skeleton;
