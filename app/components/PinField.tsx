import { useRef, useState, useEffect, type KeyboardEvent, type ClipboardEvent } from "react";
import { cn } from "../utils/cn";
import colors from "../theme/colors";

interface PinFieldProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  codeLength?: number;
  autoFocus?: boolean;
}

export function PinField({
  label,
  value,
  onValueChange,
  codeLength = 6,
  autoFocus = true,
}: PinFieldProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return; // Only allow digits

    const newValue = value.split("");
    newValue[index] = char;
    const result = newValue.join("").slice(0, codeLength);
    onValueChange(result);

    // Move to next input if character was entered
    if (char && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
        const newValue = value.split("");
        newValue[index - 1] = "";
        onValueChange(newValue.join(""));
      } else {
        const newValue = value.split("");
        newValue[index] = "";
        onValueChange(newValue.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, codeLength);
    onValueChange(pastedData);
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, codeLength - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm text-gray-600 mb-2">{label}</label>
      )}
      <div className="flex gap-2 justify-center">
        {Array.from({ length: codeLength }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            className={cn(
              "w-12 h-12 text-center text-lg font-semibold rounded-md",
              "border-2 transition-colors",
              "focus:outline-none",
              focusedIndex === index
                ? "border-teal-500 bg-white"
                : value[index]
                ? "border-green-500 bg-gray-100"
                : "border-gray-200 bg-gray-100"
            )}
            style={{
              color: focusedIndex === index ? colors.teal : colors.black,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default PinField;
