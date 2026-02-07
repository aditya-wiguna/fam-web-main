import { cn } from "../utils/cn";

interface RadioProps {
  label?: string;
  value?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
}

export function Radio({ 
  label = "", 
  value = false, 
  disabled = false, 
  onPress,
  className 
}: RadioProps) {
  const handleClick = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-row items-start justify-start mb-2",
        !disabled && "cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        <div 
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
            value 
              ? disabled ? "border-gray-400" : "border-[#10368c]"
              : disabled ? "border-gray-300" : "border-[#10368c]"
          )}
        >
          {value && (
            <div 
              className={cn(
                "w-2.5 h-2.5 rounded-full",
                disabled ? "bg-gray-400" : "bg-[#10368c]"
              )}
            />
          )}
        </div>
      </div>
      <div className="flex-grow mr-4">
        <span 
          className={cn(
            "text-base",
            value && "font-semibold",
            disabled && !value && "text-gray-300"
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export default Radio;
