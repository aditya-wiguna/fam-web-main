import { type InputHTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  helpText?: string;
  error?: string;
  onValueChange?: (value: string) => void;
}

export function Input({
  label,
  helpText,
  error,
  onValueChange,
  className,
  ...props
}: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
      )}
      <input
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          "w-full p-4 border border-gray-200 bg-white rounded text-sm",
          "focus:outline-none focus:ring-2 focus:ring-[#10368c] focus:border-transparent",
          "placeholder:text-gray-400",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default Input;
