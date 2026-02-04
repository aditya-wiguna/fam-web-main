import { cn } from "../utils/cn";

interface ProgressProps {
  steps?: number;
  currentStep?: number;
  darkBackground?: boolean;
  className?: string;
}

export function Progress({ 
  steps = 0, 
  currentStep = 0, 
  darkBackground = false,
  className 
}: ProgressProps) {
  if (steps < 2) {
    return null;
  }

  return (
    <div className={cn("flex flex-row justify-center h-2 gap-2", className)}>
      {Array.from({ length: steps }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full flex-grow max-w-[60px]",
            i + 1 <= currentStep
              ? darkBackground ? "bg-teal-400" : "bg-teal-900"
              : darkBackground ? "bg-white/50" : "bg-gray-400"
          )}
        />
      ))}
    </div>
  );
}

export default Progress;
